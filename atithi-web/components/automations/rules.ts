/* Plain-language helpers for automation rules. */
import { CARETAKER, TODAY } from "@/lib/seed";
import { addDays, plural } from "@/lib/format";
import type { Automation, Booking } from "@/lib/types";

const lower = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s);

/**
 * The rule as one sentence: "When a new booking arrives, send …".
 * Time-based triggers read without "When" ("Every day at 8 AM, send …"),
 * and a trigger without a verb gets "there is" so the sentence stays grammatical.
 */
export function ruleSentence(a: Pick<Automation, "trig" | "act">) {
  const act = lower(a.act.replace(/\.$/, ""));
  if (/^(every|one day|\d)/i.test(a.trig)) return `${a.trig}, ${act}.`;
  const hasVerb = /\b(arrives?|is|are|taps|comes?|changes?|happens?)\b/i.test(a.trig);
  return `When ${hasVerb ? "" : "there is "}${lower(a.trig)}, ${act}.`;
}

export const runsLine = (a: Pick<Automation, "runs">) => `Ran ${plural(a.runs, "time")} in the last 30 days`;

/** Rules whose first message carries the guest's Yes and Cancel buttons */
export const ASK_BUTTONS = ["Haan, aa rahe hain", "Cancel karna hai"];
export const asksGuest = (a: Automation) => /yes and cancel buttons/i.test(a.act);

/** Who receives the message this rule sends */
export const recipientOf = (a: Automation) => (a.id === "a5" || /caretaker/i.test(a.act) ? CARETAKER : "the guest");

export interface Run {
  who: string;
  ts: string;
}

/** Recent runs read from the sample bookings' timelines, newest first */
export function recentRuns(a: Automation, bookings: Booking[], limit = 4): Run[] {
  if (a.id === "a5") return [0, -1, -2, -3].slice(0, limit).map((d) => ({ who: CARETAKER, ts: `${addDays(TODAY, d)}T08:00` }));
  const match: Record<string, (text: string, i: number) => boolean> = {
    a1: (_t, i) => i === 0,
    a2: (t) => t.startsWith("WhatsApp sent asking"),
    a3: (t) => t.startsWith("Dates blocked") || t.startsWith("Dates held"),
    a4: (t) => t.startsWith("Check-in details sent"),
    a6: (t) => /^Advance of .* received/.test(t),
    a7: (t) => /review request sent/i.test(t),
    a8: (t) => /released everywhere/i.test(t) || /dates released/i.test(t),
  };
  const test = match[a.id];
  if (!test) return [];
  const runs: Run[] = [];
  for (const b of bookings)
    b.tl.forEach((e, i) => {
      if (e.tone !== "pend" && test(e.text, i)) runs.push({ who: b.guest.name, ts: e.ts });
    });
  return runs.sort((x, y) => y.ts.localeCompare(x.ts)).slice(0, limit);
}
