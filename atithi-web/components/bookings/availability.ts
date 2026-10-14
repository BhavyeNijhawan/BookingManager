/* Who holds a night, and whether a new stay or block would clash. Mirrors the checks in the store. */
import { OTAS, TODAY, UNITS, CHANNELS } from "@/lib/seed";
import { addDays, fmtRange } from "@/lib/format";
import { isLive, overlaps, unitName } from "@/lib/selectors";
import type { Block, Booking, UnitId } from "@/lib/types";

export type Occupant = { kind: "booking"; booking: Booking } | { kind: "block"; block: Block } | null;

/** What holds the night that starts on `date` for one unit */
export function nightOccupant(bookings: Booking[], blocks: Block[], unit: UnitId, date: string): Occupant {
  const next = addDays(date, 1);
  const booking = bookings.find((b) => b.unit === unit && isLive(b) && overlaps(b, date, next));
  if (booking) return { kind: "booking", booking };
  const block = blocks.find((b) => b.unit === unit && overlaps(b, date, next));
  if (block) return { kind: "block", block };
  return null;
}

/** The sentence the store would return on a clash, or null when the nights are free */
export function clashFor(bookings: Booking[], blocks: Block[], unit: UnitId, ci: string, n: number): string | null {
  const co = addDays(ci, Math.max(1, n));
  const clash =
    bookings.find((x) => x.unit === unit && isLive(x) && overlaps(x, ci, co)) ?? blocks.find((x) => x.unit === unit && overlaps(x, ci, co));
  if (!clash) return null;
  const who = "guest" in clash ? clash.guest.name : "a block";
  return `${unitName(unit)} already has ${who} on ${fmtRange(clash.ci, clash.co)}.`;
}

/** The first unit that is free for these nights, preferring `pref` */
export function freeUnit(bookings: Booking[], blocks: Block[], ci: string, n: number, pref?: UnitId): UnitId | null {
  const order = pref ? [pref, ...UNITS.map((u) => u.id).filter((u) => u !== pref)] : UNITS.map((u) => u.id);
  return order.find((u) => !clashFor(bookings, blocks, u, ci, n)) ?? null;
}

/** "A, B and C" */
export function listJoin(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** The other platforms a booking closes: "Booking.com, Agoda and MakeMyTrip" */
export function otherPlatforms(b: Booking) {
  return listJoin(OTAS.filter((c) => c !== b.channel).map((c) => CHANNELS[c].name));
}

/** Most guests a unit sleeps, read from its description ("up to 8 guests") */
export function maxGuests(unit: UnitId) {
  const meta = UNITS.find((u) => u.id === unit)?.meta ?? "";
  return Number(meta.match(/up to (\d+)/)?.[1] ?? 99);
}

/** Checkout time, with the late checkout noted on the booking */
export const checkoutTime = (b: Booking) => (b.note?.toLowerCase().includes("late checkout") ? "1 PM" : "11 AM");

export const isPast = (date: string) => date < TODAY;

/** Keeps digits only, for matching phone numbers and references */
export const digits = (s: string) => s.replace(/\D/g, "");
