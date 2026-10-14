export type ChannelId = "airbnb" | "booking" | "agoda" | "mmt" | "direct";
export type OtaId = Exclude<ChannelId, "direct">;
export type UnitId = "villa" | "cottage";

export type Status =
  | "unverified"
  | "verified"
  | "flagged"
  | "confirmed"
  | "in_house"
  | "checked_out"
  | "cancelled";

/** good = done well, acc = Atithi did something, warn = needs watching, crit = went wrong, pend = next step */
export type Tone = "good" | "acc" | "warn" | "crit" | "pend";

export type AdvanceStatus = "not_sent" | "link_sent" | "received" | "not_paid";

export type Payment =
  | { mode: "platform" }
  | { mode: "pay_at_property"; advance: { amount: number; status: AdvanceStatus } };

export interface TimelineEvent {
  ts: string; // "2026-10-11T12:40"
  tone: Tone;
  text: string;
}

export interface Guest {
  name: string;
  phone: string; // masked, or "via Airbnb"
  pax: number;
}

export interface Booking {
  id: string;
  ref: string;
  channel: ChannelId;
  unit: UnitId;
  guest: Guest;
  ci: string; // check-in date "2026-10-11"
  co: string; // checkout date
  amount: number;
  pay: Payment;
  status: Status;
  note?: string;
  tl: TimelineEvent[];
  /** Set when the owner replies by hand; automatic reminders for this booking stop. */
  manualReplyAt?: string;
}

export interface Block {
  id: string;
  unit: UnitId;
  ci: string;
  co: string;
  reason: string;
}

export interface Message {
  dir: "in" | "out";
  auto?: boolean;
  ts: string;
  text: string; // *bold* is WhatsApp bold
  replies?: string[]; // quick-reply buttons the guest sees
}

export interface Thread {
  id: string;
  bookingId: string | null;
  who: string;
  caretaker?: boolean;
  unread: number;
  msgs: Message[];
}

export interface Automation {
  id: string;
  on: boolean;
  name: string;
  trig: string;
  cond: string;
  act: string;
  runs: number;
  tpl?: string;
  system?: boolean;
}

export interface ChannelConfig {
  id: ChannelId;
  method: string;
  last: string;
  health: "ok" | "warn";
  note: string;
  ext: string | null;
}

export interface Unit {
  id: UnitId;
  name: string;
  meta: string;
  advance: number;
}

export type Palette = "paper" | "monsoon" | "chalk";
