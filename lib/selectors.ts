/* Derived facts about bookings. Pure functions over store data. */
import { CARETAKER, CHANNELS, NOW, OTAS, TODAY, UNITS } from "./seed";
import { addDays, fmtTime, inr, nightsBetween } from "./format";
import type { Block, Booking, OtaId, Status, Thread, UnitId } from "./types";

export const STATUS: Record<Status, { label: string; short: string; attention?: boolean; strong?: boolean; past?: boolean }> = {
  unverified: { label: "Not verified yet", short: "Not verified", attention: true },
  verified: { label: "Guest said yes, advance pending", short: "Advance pending", attention: true },
  flagged: { label: "Likely fake, no reply in 24 hours", short: "Likely fake", attention: true, strong: true },
  confirmed: { label: "Confirmed", short: "Confirmed" },
  in_house: { label: "Staying now", short: "Staying now" },
  checked_out: { label: "Checked out", short: "Checked out", past: true },
  cancelled: { label: "Cancelled", short: "Cancelled", past: true },
};

export const unitName = (id: UnitId | string) => UNITS.find((u) => u.id === id)?.name ?? id;
export const channelName = (b: Pick<Booking, "channel">) => CHANNELS[b.channel].name;
export const isLive = (b: Booking) => b.status !== "cancelled";
export const overlaps = (b: { ci: string; co: string }, a: string, z: string) => b.ci < z && b.co > a;
export const needsAction = (b: Booking) => b.status === "unverified" || b.status === "verified" || b.status === "flagged";
export const isPayAtProperty = (b: Booking) => b.pay.mode === "pay_at_property";
export const byCheckIn = (a: Booking, b: Booking) => a.ci.localeCompare(b.ci);
export const nights = (b: { ci: string; co: string }) => nightsBetween(b.ci, b.co);

export const advanceOf = (b: Booking) => (b.pay.mode === "pay_at_property" ? b.pay.advance : null);

/** How the guest pays, in words: "Paid on Airbnb", "MakeMyTrip, pay at property" */
export const payMode = (b: Booking) =>
  b.pay.mode === "platform"
    ? `Paid on ${channelName(b)}`
    : b.channel === "direct"
      ? "Direct, pay at property"
      : `${channelName(b)}, pay at property`;

/** Amount still to collect at the property */
export const toCollect = (b: Booking) => {
  if (b.pay.mode === "platform") return 0;
  const adv = b.pay.advance;
  return adv.status === "received" ? b.amount - adv.amount : b.amount;
};

/** Money in one sentence: "₹2,500 advance unpaid, ₹9,800 due at property" */
export const moneyLine = (b: Booking) => {
  if (b.pay.mode === "platform") return `Paid on ${channelName(b)}`;
  const adv = b.pay.advance;
  if (adv.status === "received") return `${inr(adv.amount)} advance paid, ${inr(b.amount - adv.amount)} at check-in`;
  if (adv.status === "link_sent") return `${inr(adv.amount)} advance unpaid, ${inr(b.amount)} due at property`;
  return `${inr(b.amount)} due at property`;
};

/** Short money for lists: "Paid", "₹10,000 to collect" */
export const moneyShort = (b: Booking) => {
  if (b.pay.mode === "platform") return "Paid";
  const due = toCollect(b);
  return `${inr(due)} to collect`;
};

/** Estimated payout after platform commission (sample figure: 85%) */
export const payout = (b: Booking) => Math.round(b.amount * 0.85);

export type SyncState = "source" | "blocked" | "updating" | "open";
export interface PlatformSync {
  ch: OtaId;
  state: SyncState;
  detail: string;
}

/** Whether each platform's calendar is closed for this booking's nights */
export function platformSync(b: Booking): PlatformSync[] {
  if (b.status === "cancelled")
    return OTAS.map((ch) => ({ ch, state: "open", detail: ch === b.channel ? "Cancelled here" : "Nights released" }));
  const received = b.tl[0]?.ts ?? NOW;
  const fresh = new Date(`${NOW}Z`).getTime() - new Date(`${received}Z`).getTime() < 20 * 6e4;
  return OTAS.map((ch) => {
    if (ch === b.channel) return { ch, state: "source", detail: "The booking came from here" };
    if (fresh) return { ch, state: "updating", detail: `Pushed at ${fmtTime(received)}, usually applied within minutes` };
    return { ch, state: "blocked", detail: "Calendar closed for these nights" };
  });
}
export const closedCount = (rows: PlatformSync[]) => rows.filter((r) => r.state === "source" || r.state === "blocked").length;

/* ---------- verification track ---------- */

export type StepState = "done" | "current" | "failed" | "todo";
export interface TrackStep {
  key: string;
  label: string;
  state: StepState;
  when?: string; // timestamp
  note?: string;
}

const findTs = (b: Booking, test: (text: string) => boolean) => b.tl.find((t) => test(t.text))?.ts;

/** The four steps a pay-at-property booking goes through before it is safe */
export function verificationTrack(b: Booking): TrackStep[] {
  const received = b.tl[0]?.ts;
  const asked = findTs(b, (t) => t.startsWith("WhatsApp sent"));
  const yes = findTs(b, (t) => t.startsWith("Guest tapped “Haan") || t.startsWith("Guest confirmed"));
  const paid = findTs(b, (t) => t.startsWith("Advance") && (t.includes("received") || t.includes("marked")));
  const flagged = findTs(b, (t) => t.startsWith("Flagged"));
  const adv = advanceOf(b);
  const s = b.status;

  const steps: TrackStep[] = [
    { key: "booked", label: "Booked", state: "done", when: received },
    { key: "asked", label: "Asked on WhatsApp", state: asked || !needsAction(b) ? "done" : "current", when: asked },
    { key: "yes", label: "Guest said yes", state: "todo" },
    { key: "paid", label: adv ? "Advance paid" : "Confirmed", state: "todo" },
  ];

  if (s === "unverified") {
    steps[2] = { ...steps[2], state: "current", note: "Waiting for a reply" };
  } else if (s === "flagged" || (s === "cancelled" && flagged)) {
    steps[2] = { ...steps[2], state: "failed", when: flagged, note: "No reply in 24 hours" };
  } else if (s === "verified") {
    steps[2] = { ...steps[2], state: "done", when: yes };
    steps[3] = { ...steps[3], state: "current", note: adv ? `${inr(adv.amount)} unpaid` : undefined };
  } else if (s === "cancelled") {
    steps[2] = { ...steps[2], state: "failed", note: "Cancelled" };
  } else {
    steps[2] = { ...steps[2], state: "done", when: yes ?? paid };
    steps[3] = { ...steps[3], state: "done", when: paid };
  }
  return steps;
}

/** Why a booking needs Rohan, in one plain sentence */
export function attentionReason(b: Booking): string {
  if (b.manualReplyAt && (b.status === "unverified" || b.status === "verified"))
    return "You replied on WhatsApp, so automatic reminders have stopped. Follow up yourself or call the guest.";
  if (b.status === "unverified") {
    const asked = findTs(b, (t) => t.startsWith("WhatsApp sent")) ?? NOW;
    const mins = Math.round((new Date(`${NOW}Z`).getTime() - new Date(`${asked}Z`).getTime()) / 6e4);
    const when = mins < 1 ? "just now" : mins < 60 ? `${mins} minutes ago` : `${Math.round(mins / 60)} hours ago`;
    return `Asked on WhatsApp ${when} and no reply yet. The nights stay held on every platform meanwhile.`;
  }
  if (b.status === "verified") {
    const adv = advanceOf(b);
    return `The guest said yes, but the ${adv ? inr(adv.amount) : ""} advance is still unpaid. The next reminder goes at 6 PM.`;
  }
  if (b.status === "flagged") return "24 hours, two reminders, no reply and no advance. This is what a fake pay-at-property booking looks like.";
  return "";
}

/* ---------- today ---------- */

export interface Movement {
  kind: "out" | "in" | "stay";
  time: string;
  booking: Booking;
}

export function todaysMovements(bookings: Booking[]): Movement[] {
  const live = bookings.filter(isLive);
  const outs = live.filter((b) => b.co === TODAY && b.status !== "checked_out");
  const doneOuts = live.filter((b) => b.co === TODAY && b.status === "checked_out");
  const ins = live.filter((b) => b.ci === TODAY);
  const stays = live.filter((b) => b.ci < TODAY && b.co > TODAY);
  const lateOut = (b: Booking) => (b.note?.toLowerCase().includes("late checkout") ? "1 PM" : "11 AM");
  return [
    ...outs.map((b) => ({ kind: "out" as const, time: lateOut(b), booking: b })),
    ...doneOuts.map((b) => ({ kind: "out" as const, time: lateOut(b), booking: b })),
    ...ins.map((b) => ({ kind: "in" as const, time: "1 PM", booking: b })),
    ...stays.map((b) => ({ kind: "stay" as const, time: "", booking: b })),
  ];
}

/* ---------- scheduled sends ---------- */

export interface Scheduled {
  ts: string;
  booking: Booking | null;
  what: string;
  rule: string;
}

export function scheduledSends(bookings: Booking[]): Scheduled[] {
  const out: Scheduled[] = [];
  for (const b of bookings) {
    if (b.status === "unverified" && !b.manualReplyAt) {
      out.push({ ts: `${TODAY}T22:33`, booking: b, what: "Reminder to confirm the booking", rule: "Verify pay-at-property bookings" });
      out.push({ ts: `${addDays(TODAY, 1)}T10:33`, booking: b, what: "Flag as likely fake if still no reply", rule: "Verify pay-at-property bookings" });
    }
    if (b.status === "verified" && !b.manualReplyAt) {
      const adv = advanceOf(b);
      out.push({ ts: `${TODAY}T18:00`, booking: b, what: `Payment reminder for the ${adv ? inr(adv.amount) : ""} advance`, rule: "Verify pay-at-property bookings" });
    }
    if (b.status === "confirmed" && b.ci > TODAY)
      out.push({ ts: `${addDays(b.ci, -1)}T09:00`, booking: b, what: "Check-in details: address, timings, caretaker", rule: "Send check-in details the day before" });
    if ((b.status === "in_house" || b.status === "confirmed") && b.co >= TODAY)
      out.push({ ts: `${addDays(b.co, 1)}T11:00`, booking: b, what: "Thank-you and review request", rule: "Thank-you and review request" });
  }
  out.push({ ts: `${addDays(TODAY, 1)}T08:00`, booking: null, what: `Morning briefing for ${CARETAKER}, in Hindi`, rule: "Morning briefing for Ramesh bhai" });
  return out.filter((s) => s.ts > NOW).sort((a, b) => a.ts.localeCompare(b.ts));
}

/* ---------- numbers ---------- */

export function monthNumbers(bookings: Booking[], ym = TODAY.slice(0, 7)) {
  const start = `${ym}-01`;
  const [y, m] = ym.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const end = addDays(start, daysInMonth);
  const live = bookings.filter(isLive);
  const starting = live.filter((b) => b.ci.startsWith(ym));
  const value = starting.reduce((a, b) => a + b.amount, 0);
  const soldNights = live.reduce((a, b) => {
    const s = b.ci < start ? start : b.ci;
    const e = b.co > end ? end : b.co;
    return a + Math.max(0, nightsBetween(s, e));
  }, 0);
  const capacity = daysInMonth * UNITS.length;
  const caught = bookings.filter((b) => b.status === "cancelled" && b.channel === "mmt");
  const freed = caught.reduce((a, b) => a + b.amount, 0);
  const collect = live.filter((b) => b.ci >= TODAY && b.ci.startsWith(ym)).reduce((a, b) => a + toCollect(b), 0);
  const byChannel = Object.fromEntries(Object.keys(CHANNELS).map((c) => [c, 0])) as Record<string, number>;
  starting.forEach((b) => (byChannel[b.channel] += b.amount));
  return { value, soldNights, capacity, occupancy: Math.round((soldNights / capacity) * 100), caught: caught.length, freed, collect, byChannel, count: starting.length };
}

/* ---------- calendar ---------- */

export type ChartItem =
  | { kind: "booking"; id: string; ci: string; co: string; booking: Booking }
  | { kind: "block"; id: string; ci: string; co: string; block: Block };

export function itemsForUnit(bookings: Booking[], blocks: Block[], unit: UnitId, from: string, to: string): ChartItem[] {
  const items: ChartItem[] = [
    ...bookings
      .filter((b) => b.unit === unit && isLive(b) && overlaps(b, from, to))
      .map((b) => ({ kind: "booking" as const, id: b.id, ci: b.ci, co: b.co, booking: b })),
    ...blocks
      .filter((b) => b.unit === unit && overlaps(b, from, to))
      .map((b) => ({ kind: "block" as const, id: b.id, ci: b.ci, co: b.co, block: b })),
  ];
  return items.sort((a, b) => a.ci.localeCompare(b.ci));
}

export const unreadCount = (threads: Thread[]) => threads.reduce((a, t) => a + t.unread, 0);
export const threadForBooking = (threads: Thread[], id: string) => threads.find((t) => t.bookingId === id);
