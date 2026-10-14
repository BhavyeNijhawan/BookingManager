"use client";

/* The prototype's state: sample data plus every action the owner or a guest can take.
   It lives in memory only. Reloading the page or "Reset sample data" starts over. */
import { create } from "zustand";
import { toast } from "sonner";
import { CARETAKER, CITY, NOW, PROPERTY, SEED_AUTOMATIONS, SEED_BLOCKS, SEED_BOOKINGS, SEED_THREADS, TODAY } from "./seed";
import { addDays, firstName, fmtRange, guestsWord, inr, nightsWord } from "./format";
import { advanceOf, channelName, isLive, overlaps, unitName } from "./selectors";
import type { Automation, Block, Booking, Thread, Tone, UnitId } from "./types";

export type SheetState =
  | { kind: "day"; date: string }
  | { kind: "add" }
  | { kind: "direct"; date?: string; unit?: UnitId }
  | { kind: "block"; date?: string; unit?: UnitId }
  | { kind: "block-info"; id: string }
  | { kind: "cancel"; id: string }
  | { kind: "demo" }
  | { kind: "intro" };

export interface DirectInput {
  name: string;
  phone: string;
  pax: number;
  unit: UnitId;
  ci: string;
  nights: number;
  amount: number;
  advance: number;
}

export interface BlockInput {
  unit: UnitId;
  ci: string;
  nights: number;
  reason: string;
}

type Who = "you" | "caretaker";

interface State {
  bookings: Booking[];
  blocks: Block[];
  threads: Thread[];
  autos: Automation[];
  demoStep: number;
  /** Scheduled sends the owner skipped, by key */
  skipped: string[];
  /** The last sheet opened. It stays set while the close animation runs. */
  sheet: SheetState | null;
  sheetOpen: boolean;

  openSheet: (s: SheetState) => void;
  closeSheet: () => void;

  remind: (id: string) => void;
  remindPay: (id: string) => void;
  markConfirmed: (id: string) => void;
  checkIn: (id: string, by?: Who) => void;
  checkOut: (id: string, by?: Who) => void;
  cancelRelease: (id: string) => void;

  ensureThread: (bookingId: string) => string;
  markRead: (threadId: string) => void;
  sendMessage: (threadId: string, text: string) => void;
  quickReply: (threadId: string, reply: string) => void;
  skipScheduled: (what: string) => void;
  toggleSkip: (key: string) => void;

  addDirect: (input: DirectInput) => { ok: true; id: string } | { ok: false; reason: string };
  addBlock: (input: BlockInput) => { ok: true; id: string } | { ok: false; reason: string };
  unblock: (id: string) => void;
  toggleAuto: (id: string) => void;

  demoReceive: () => void;
  demoConfirm: () => void;
  demoPay: () => void;
  demoFlag: () => void;
  demoReset: () => void;
  reset: () => void;
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

const seed = () => ({
  bookings: clone(SEED_BOOKINGS),
  blocks: clone(SEED_BLOCKS),
  threads: clone(SEED_THREADS),
  autos: clone(SEED_AUTOMATIONS),
  demoStep: 0,
  skipped: [] as string[],
});

/** Drop pending "next" events, then add a new event */
const withEvent = (b: Booking, tone: Tone, text: string, ts = NOW): Booking => ({
  ...b,
  tl: [...b.tl.filter((t) => t.tone !== "pend"), { ts, tone, text }],
});

const pend = (b: Booking, text: string, ts = NOW): Booking => ({ ...b, tl: [...b.tl, { ts, tone: "pend", text }] });

const ASK_REPLIES = ["Haan, aa rahe hain", "Cancel karna hai"];

export const useStore = create<State>()((set, get) => {
  const patch = (id: string, fn: (b: Booking) => Booking) =>
    set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? fn(b) : b)) }));
  const find = (id: string) => get().bookings.find((b) => b.id === id);
  const pushMsg = (threadId: string, msg: Thread["msgs"][number]) =>
    set((s) => ({ threads: s.threads.map((t) => (t.id === threadId ? { ...t, msgs: [...t.msgs, msg] } : t)) }));

  return {
    ...seed(),
    sheet: null,
    sheetOpen: false,

    openSheet: (sheet) => set({ sheet, sheetOpen: true }),
    closeSheet: () => set({ sheetOpen: false }),

    remind: (id) => {
      const b = find(id);
      if (!b) return;
      const tid = get().ensureThread(id);
      pushMsg(tid, {
        dir: "out",
        ts: NOW,
        text: `Reminder: Kripya apni ${fmtRange(b.ci, b.co)} booking confirm karein 🙏 Bina confirmation ke dates hold nahi ho payengi.`,
        replies: ASK_REPLIES,
      });
      patch(id, (x) => pend(withEvent(x, "warn", "Reminder sent by you"), "Waiting for a reply"));
      toast("Reminder sent on WhatsApp", { description: `${b.guest.name} sees Yes and Cancel buttons again.` });
    },

    remindPay: (id) => {
      const b = find(id);
      const adv = b && advanceOf(b);
      if (!b || !adv) return;
      const tid = get().ensureThread(id);
      pushMsg(tid, {
        dir: "out",
        ts: NOW,
        text: `Reminder: ${inr(adv.amount)} advance abhi pending hai. Link: rzp.io/l/amberwood-${adv.amount}\nDates sirf payment ke baad lock hoti hain.`,
      });
      patch(id, (x) => pend(withEvent(x, "warn", "Payment link resent by you"), "Waiting for the advance"));
      toast("Payment link resent", { description: `${b.guest.name}, ${inr(adv.amount)} advance` });
    },

    markConfirmed: (id) => {
      const b = find(id);
      if (!b) return;
      const adv = advanceOf(b);
      patch(id, (x) => {
        const pay = x.pay.mode === "pay_at_property" ? { ...x.pay, advance: { ...x.pay.advance, status: "received" as const } } : x.pay;
        return withEvent(
          { ...x, status: "confirmed", pay },
          "good",
          adv ? `Advance of ${inr(adv.amount)} marked received by you. Booking confirmed` : "Marked confirmed by you",
        );
      });
      const tid = get().ensureThread(id);
      pushMsg(tid, {
        dir: "out",
        auto: true,
        ts: NOW,
        text: `Booking confirmed ✅ ${fmtRange(b.ci, b.co)}, ${unitName(b.unit)}. Check-in details aapko ek din pehle mil jayengi. Shukriya ${firstName(b.guest.name)} ji!`,
      });
      toast("Booking confirmed", { description: `${b.guest.name}, ${fmtRange(b.ci, b.co)}. The guest got a confirmation on WhatsApp.` });
    },

    checkIn: (id, by = "you") => {
      const b = find(id);
      if (!b) return;
      patch(id, (x) => withEvent({ ...x, status: "in_house" }, "good", `Checked in, marked by ${by === "caretaker" ? CARETAKER : "you"}`));
      toast("Checked in", { description: `${b.guest.name}, ${unitName(b.unit)}${by === "caretaker" ? `, marked by ${CARETAKER}` : ""}` });
    },

    checkOut: (id, by = "you") => {
      const b = find(id);
      if (!b) return;
      patch(id, (x) =>
        pend(
          withEvent({ ...x, status: "checked_out" }, "good", `Checked out, marked by ${by === "caretaker" ? CARETAKER : "you"}`),
          "Thank-you and review request go tomorrow at 11 AM",
          `${addDays(TODAY, 1)}T11:00`,
        ),
      );
      toast("Checked out", { description: `${b.guest.name}. The review request goes tomorrow at 11 AM.` });
    },

    cancelRelease: (id) => {
      const b = find(id);
      if (!b) return;
      patch(id, (x) =>
        withEvent(
          { ...x, status: "cancelled" },
          "crit",
          x.channel === "mmt" ? "Cancelled by you on the MakeMyTrip extranet. Dates released everywhere" : "Cancelled by you. Dates released everywhere",
        ),
      );
      const tid = get().ensureThread(id);
      pushMsg(tid, {
        dir: "out",
        auto: true,
        ts: NOW,
        text: `Aapki ${fmtRange(b.ci, b.co)} booking cancel kar di gayi hai kyunki confirmation nahi mili. Agar aap aana chahte hain to yahin message karein, dates available hone par hum dobara book kar denge.`,
      });
      toast("Cancelled and dates released", { description: `${fmtRange(b.ci, b.co)} is open again on Airbnb, Booking.com, Agoda and MakeMyTrip.` });
      set({ sheetOpen: false });
    },

    ensureThread: (bookingId) => {
      const existing = get().threads.find((t) => t.bookingId === bookingId);
      if (existing) return existing.id;
      const b = find(bookingId);
      const t: Thread = { id: `t${bookingId}`, bookingId, who: b?.guest.name ?? "Guest", unread: 0, msgs: [] };
      set((s) => ({ threads: [t, ...s.threads] }));
      return t.id;
    },

    markRead: (threadId) =>
      set((s) => ({ threads: s.threads.map((t) => (t.id === threadId && t.unread ? { ...t, unread: 0 } : t)) })),

    sendMessage: (threadId, text) => {
      const clean = text.trim();
      if (!clean) return;
      pushMsg(threadId, { dir: "out", ts: NOW, text: clean });
      // A reply by hand replaces the automatic reminder, so it is dropped.
      const t = get().threads.find((x) => x.id === threadId);
      const b = t?.bookingId ? find(t.bookingId) : undefined;
      if (b && (b.status === "unverified" || b.status === "verified") && !b.manualReplyAt) {
        patch(b.id, (x) => ({ ...withEvent(x, "acc", "You replied on WhatsApp. Automatic reminders stopped"), manualReplyAt: NOW }));
        toast("Automatic reminder dropped", { description: `You replied to ${b.guest.name} yourself, so Atithi will not send the reminder.` });
      }
    },

    quickReply: (threadId, reply) => {
      const t = get().threads.find((x) => x.id === threadId);
      const b = t?.bookingId ? find(t.bookingId) : undefined;
      if (!t || !b) return;
      pushMsg(threadId, { dir: "in", ts: NOW, text: reply });
      if (reply.startsWith("Haan")) {
        const adv = advanceOf(b);
        patch(b.id, (x) => {
          const pay = x.pay.mode === "pay_at_property" ? { ...x.pay, advance: { ...x.pay.advance, status: "link_sent" as const } } : x.pay;
          let next = withEvent({ ...x, status: "verified", pay }, "good", "Guest tapped “Haan, aa rahe hain”");
          next = { ...next, tl: [...next.tl, { ts: NOW, tone: "acc", text: `Payment link for ${adv ? inr(adv.amount) : "the advance"} sent` }] };
          return pend(next, "Waiting for the advance, reminder in 12 hours");
        });
        pushMsg(threadId, {
          dir: "out",
          auto: true,
          ts: NOW,
          text: `Shukriya ${firstName(b.guest.name)} ji! Advance ${adv ? inr(adv.amount) : ""} ke liye secure link:\nrzp.io/l/amberwood-${adv?.amount ?? ""}\n\nPayment hote hi booking confirm ho jayegi.`,
        });
        toast(`${b.guest.name} confirmed`, { description: "The advance link went out automatically." });
      } else {
        patch(b.id, (x) => withEvent({ ...x, status: "cancelled" }, "crit", "Guest tapped “Cancel karna hai”. Dates released everywhere"));
        pushMsg(threadId, { dir: "out", auto: true, ts: NOW, text: "Theek hai, booking cancel kar di gayi hai. Dhanyavaad batane ke liye 🙏" });
        toast(`${b.guest.name} cancelled`, { description: `${fmtRange(b.ci, b.co)} is open again on every platform.` });
      }
    },

    skipScheduled: (what) => toast("Skipped", { description: what }),
    toggleSkip: (key) => set((s) => ({ skipped: s.skipped.includes(key) ? s.skipped.filter((k) => k !== key) : [...s.skipped, key] })),

    addDirect: (input) => {
      const { bookings, blocks } = get();
      const co = addDays(input.ci, Math.max(1, input.nights));
      const clash =
        bookings.find((x) => x.unit === input.unit && isLive(x) && overlaps(x, input.ci, co)) ??
        blocks.find((x) => x.unit === input.unit && overlaps(x, input.ci, co));
      if (clash) {
        const who = "guest" in clash ? clash.guest.name : "a block";
        return { ok: false, reason: `${unitName(input.unit)} already has ${who} on ${fmtRange(clash.ci, clash.co)}.` };
      }
      const id = `bd${bookings.length + 1}${input.ci.replace(/-/g, "")}`;
      const n = Math.max(1, input.nights);
      const b: Booking = {
        id,
        ref: `DIR-0${100 + bookings.filter((x) => x.channel === "direct").length}`,
        channel: "direct",
        unit: input.unit,
        guest: { name: input.name.trim() || "Guest", phone: input.phone.trim() || "Not given", pax: Math.max(1, input.pax) },
        ci: input.ci,
        co,
        amount: input.amount,
        pay: { mode: "pay_at_property", advance: { amount: input.advance, status: "not_sent" } },
        status: "unverified",
        tl: [
          { ts: NOW, tone: "good", text: "Direct booking added by you" },
          { ts: NOW, tone: "acc", text: "Dates blocked on Airbnb, Booking.com, Agoda and MakeMyTrip" },
          { ts: NOW, tone: "acc", text: `WhatsApp sent asking the guest to confirm, with a ${inr(input.advance)} advance` },
          { ts: NOW, tone: "pend", text: "Waiting for a reply, reminder in 12 hours" },
        ],
      };
      const thread: Thread = {
        id: `t${id}`,
        bookingId: id,
        who: b.guest.name,
        unread: 0,
        msgs: [
          {
            dir: "out",
            auto: true,
            ts: NOW,
            replies: ASK_REPLIES,
            text: `Namaste ${firstName(b.guest.name)} ji 🙏\nAapki booking *${PROPERTY}, ${CITY}, ${unitName(b.unit)}* ke liye *${fmtRange(b.ci, b.co)} (${nightsWord(n)}, ${guestsWord(b.guest.pax)})* receive hui hai.\n\nKya aap confirm karenge ki aap aa rahe hain? Booking lock karne ke liye ${inr(input.advance)} advance pay karna hoga, balance ${inr(input.amount - input.advance)} check-in par.`,
          },
        ],
      };
      set((s) => ({ bookings: [...s.bookings, b], threads: [thread, ...s.threads], sheetOpen: false }));
      toast("Direct booking added", { description: `${b.guest.name}, ${fmtRange(b.ci, b.co)}. Dates closed on all four platforms.` });
      return { ok: true, id };
    },

    addBlock: (input) => {
      const { bookings, blocks } = get();
      const co = addDays(input.ci, Math.max(1, input.nights));
      const clash =
        bookings.find((x) => x.unit === input.unit && isLive(x) && overlaps(x, input.ci, co)) ??
        blocks.find((x) => x.unit === input.unit && overlaps(x, input.ci, co));
      if (clash) {
        const who = "guest" in clash ? clash.guest.name : "a block";
        return { ok: false, reason: `${unitName(input.unit)} already has ${who} on ${fmtRange(clash.ci, clash.co)}.` };
      }
      const id = `blk${blocks.length + 2}${input.ci.replace(/-/g, "")}`;
      set((s) => ({ blocks: [...s.blocks, { id, unit: input.unit, ci: input.ci, co, reason: input.reason.trim() || "Blocked by you" }], sheetOpen: false }));
      toast(`Blocked ${fmtRange(input.ci, co)}`, { description: `${unitName(input.unit)} is closed on Airbnb, Booking.com, Agoda and MakeMyTrip.` });
      return { ok: true, id };
    },

    unblock: (id) => {
      set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id), sheetOpen: false }));
      toast("Unblocked", { description: "The nights are open again on every platform." });
    },

    toggleAuto: (id) => {
      const a = get().autos.find((x) => x.id === id);
      if (!a) return;
      set((s) => ({ autos: s.autos.map((x) => (x.id === id ? { ...x, on: !x.on } : x)) }));
      toast(a.on ? "Automation off" : "Automation on", { description: a.name });
    },

    /* ---------- the demo story: a MakeMyTrip pay-at-property booking ---------- */

    demoReceive: () => {
      if (find("bdemo")) {
        set((s) => ({ demoStep: Math.max(s.demoStep, 1) }));
        return;
      }
      const b: Booking = {
        id: "bdemo",
        ref: "NH7203460022",
        channel: "mmt",
        unit: "villa",
        guest: { name: "Arjun Mehta", phone: "+91 99••• ••318", pax: 6 },
        ci: "2026-10-20",
        co: "2026-10-21",
        amount: 14500,
        pay: { mode: "pay_at_property", advance: { amount: 3000, status: "not_sent" } },
        status: "unverified",
        tl: [
          { ts: NOW, tone: "warn", text: "Booking received from MakeMyTrip, pay at property (read from the InGo email)" },
          { ts: NOW, tone: "acc", text: "Dates held on Airbnb, Booking.com and Agoda" },
          { ts: NOW, tone: "acc", text: "WhatsApp sent asking the guest to confirm, with a ₹3,000 advance" },
          { ts: NOW, tone: "pend", text: "Waiting for a reply. Reminder in 12 hours, flagged at 24" },
        ],
      };
      const t: Thread = {
        id: "tbdemo",
        bookingId: "bdemo",
        who: "Arjun Mehta",
        unread: 0,
        msgs: [
          {
            dir: "out",
            auto: true,
            ts: NOW,
            replies: ASK_REPLIES,
            text: "Namaste Arjun ji 🙏\nAapki booking *Amberwood Stays, Lonavala, Main Villa* ke liye *20–21 Oct (1 night, 6 guests)* MakeMyTrip par receive hui hai.\n\nKya aap confirm karenge ki aap aa rahe hain? Booking lock karne ke liye ₹3,000 advance pay karna hoga, balance ₹11,500 check-in par.",
          },
        ],
      };
      set((s) => ({ bookings: [...s.bookings, b], threads: [t, ...s.threads], demoStep: 1, sheetOpen: false }));
      toast("New booking from MakeMyTrip", { description: "Arjun Mehta, 20–21 Oct, pay at property. Verification started." });
      setTimeout(() => toast("Dates held on Airbnb, Booking.com and Agoda", { description: "Main Villa, night of 20 Oct" }), 1400);
    },

    demoConfirm: () => {
      if (!find("bdemo")) return;
      const ts = "2026-10-11T12:49";
      pushMsg("tbdemo", { dir: "in", ts, text: "Haan, aa rahe hain" });
      patch("bdemo", (x) => {
        let next = withEvent(
          { ...x, status: "verified", pay: { mode: "pay_at_property", advance: { amount: 3000, status: "link_sent" } } },
          "good",
          "Guest tapped “Haan, aa rahe hain”",
          ts,
        );
        next = { ...next, tl: [...next.tl, { ts, tone: "acc", text: "Payment link for ₹3,000 sent" }] };
        return pend(next, "Waiting for the advance, reminder in 12 hours", ts);
      });
      pushMsg("tbdemo", {
        dir: "out",
        auto: true,
        ts,
        text: "Shukriya Arjun ji! Advance ₹3,000 ke liye secure link:\nrzp.io/l/amberwood-3000\n\nPayment hote hi booking confirm ho jayegi aur check-in details ek din pehle mil jayengi.",
      });
      set({ demoStep: 2, sheetOpen: false });
      toast("Arjun Mehta said yes", { description: "The ₹3,000 advance link went out automatically." });
    },

    demoPay: () => {
      if (!find("bdemo")) return;
      const ts = "2026-10-11T12:55";
      patch("bdemo", (x) => {
        let next = withEvent(
          { ...x, status: "confirmed", pay: { mode: "pay_at_property", advance: { amount: 3000, status: "received" } } },
          "good",
          "Advance of ₹3,000 received through Razorpay (UPI)",
          ts,
        );
        next = { ...next, tl: [...next.tl, { ts, tone: "good", text: "Booking confirmed. You and Ramesh bhai were notified" }] };
        return pend(next, "Check-in details go to the guest on 19 Oct at 9 AM", "2026-10-19T09:00");
      });
      pushMsg("tbdemo", {
        dir: "out",
        auto: true,
        ts,
        text: "Advance ₹3,000 mil gaya, shukriya Arjun ji ✅ Aapki booking *20–21 Oct, Main Villa* ab confirmed hai. Balance ₹11,500 check-in par. Check-in details 19 Oct ko mil jayengi.",
      });
      set({ demoStep: 3, sheetOpen: false });
      toast("₹3,000 received from Arjun Mehta", { description: "Booking confirmed. 20–21 Oct is locked on every platform." });
    },

    demoFlag: () => {
      if (!find("bdemo")) return;
      pushMsg("tbdemo", { dir: "out", auto: true, ts: "2026-10-12T00:33", text: "Reminder: Kripya apni 20–21 Oct booking confirm karein 🙏" });
      pushMsg("tbdemo", { dir: "out", auto: true, ts: "2026-10-12T06:33", text: "Last reminder: 20–21 Oct booking aaj 10:33 AM tak confirm na hone par cancel maani jayegi." });
      patch("bdemo", (x) => {
        let next = withEvent({ ...x, status: "flagged" }, "warn", "First reminder sent, no reply", "2026-10-12T00:33");
        next = {
          ...next,
          tl: [
            ...next.tl,
            { ts: "2026-10-12T06:33", tone: "warn", text: "Second reminder sent, no reply" },
            { ts: "2026-10-12T10:33", tone: "crit", text: "Flagged as likely fake: 24 hours, no reply, no advance" },
          ],
        };
        return pend(next, "Your call: cancel on MakeMyTrip and release the dates, or phone the guest", "2026-10-12T10:33");
      });
      set({ demoStep: 3, sheetOpen: false });
      toast("Likely fake booking", { description: "Arjun Mehta never replied in 24 hours. Cancel on MakeMyTrip with one tap." });
    },

    demoReset: () => {
      set((s) => ({
        bookings: s.bookings.filter((b) => b.id !== "bdemo"),
        threads: s.threads.filter((t) => t.id !== "tbdemo"),
        demoStep: 0,
      }));
      toast("Demo reset");
    },

    reset: () => {
      set({ ...seed(), sheetOpen: false });
      toast("Sample data reset", { description: "Back to Sunday 11 October, 12:40 PM." });
    },
  };
});

export const useBooking = (id: string) => useStore((s) => s.bookings.find((b) => b.id === id));
export const describeChannel = channelName;
