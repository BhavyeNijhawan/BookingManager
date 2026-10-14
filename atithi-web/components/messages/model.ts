/* Pure helpers for the WhatsApp inbox: previews, context lines, ordering. */
import { TODAY } from "@/lib/seed";
import { fmtDay, fmtRange, fmtTime } from "@/lib/format";
import { channelName, unitName } from "@/lib/selectors";
import type { Booking, Message, Thread } from "@/lib/types";

export type InboxView = "chats" | "scheduled";
export const viewOf = (v: string | null | undefined): InboxView => (v === "scheduled" ? "scheduled" : "chats");

export const lastMsg = (t: Thread): Message | undefined => t.msgs[t.msgs.length - 1];
const lastTs = (t: Thread) => lastMsg(t)?.ts ?? "";
/** Newest conversation first */
export const byNewest = (a: Thread, b: Thread) => lastTs(b).localeCompare(lastTs(a));

/** WhatsApp text on one line: bold markers removed, line breaks folded */
export const oneLine = (text: string) => text.replace(/\*/g, "").replace(/\s*\n+\s*/g, " ").trim();

/** "You: …" for messages Rohan typed, "Auto: …" for automations, nothing for the guest */
export function previewOf(m?: Message) {
  if (!m) return "No messages yet";
  const who = m.dir === "out" ? (m.auto ? "Auto: " : "You: ") : "";
  return who + oneLine(m.text);
}

/** "12:05 PM" today, "9 Oct" before */
export const listStamp = (ts: string) => (ts.startsWith(TODAY) ? fmtTime(ts) : fmtDay(ts));

/** "MakeMyTrip, 18–19 Oct, Main Villa", or what the caretaker thread is for */
export function contextOf(t: Thread, b?: Booking) {
  if (t.caretaker) return "Caretaker, daily briefing";
  if (!b) return "WhatsApp";
  return `${channelName(b)}, ${fmtRange(b.ci, b.co)}, ${unitName(b.unit)}`;
}

/** Devanagari text needs lang="hi" for the right shaping and screen reader voice */
export const isHindi = (text: string) => /[ऀ-ॿ]/.test(text);

/** Minutes between two "YYYY-MM-DDTHH:mm" stamps */
export const minutesBetween = (a: string, b: string) =>
  Math.abs(new Date(`${b}:00Z`).getTime() - new Date(`${a}:00Z`).getTime()) / 6e4;
