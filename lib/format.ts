/* Formatting helpers. Dates are plain "YYYY-MM-DD" strings and timestamps "YYYY-MM-DDTHH:mm",
   always interpreted in UTC so the server render and the browser render agree. */
import { NOW, TODAY } from "./seed";

const utc = (s: string) => {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  const [hh, mm] = s.length > 10 ? s.slice(11, 16).split(":").map(Number) : [0, 0];
  return new Date(Date.UTC(y, m - 1, d, hh, mm));
};

const f = (opts: Intl.DateTimeFormatOptions, locale = "en-IN") =>
  new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...opts });

const dDayMon = f({ day: "numeric", month: "short" });
const dDowDayMon = f({ weekday: "short", day: "numeric", month: "short" });
const dLong = f({ weekday: "long", day: "numeric", month: "long" });
const dMonth = f({ month: "long", year: "numeric" });
const dMonthShort = f({ month: "short" });
const dWeekdayShort = f({ weekday: "short" });
const dWeekdayNarrow = f({ weekday: "narrow" });
const dTime = f({ hour: "numeric", minute: "2-digit", hour12: true }, "en-US");
const money = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export const toDate = utc;

export const iso = (d: Date) => d.toISOString().slice(0, 10);

export const addDays = (s: string, n: number) => {
  const d = utc(s);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};

export const nightsBetween = (a: string, b: string) => Math.round((utc(b).getTime() - utc(a).getTime()) / 864e5);

export const dow = (s: string) => utc(s).getUTCDay(); // 0 Sunday
export const isWeekend = (s: string) => {
  const d = dow(s);
  return d === 0 || d === 6;
};
export const dayOfMonth = (s: string) => utc(s).getUTCDate();

/** "11 Oct" */
export const fmtDay = (s: string) => dDayMon.format(utc(s));
/** "Sun, 11 Oct" */
export const fmtDow = (s: string) => dDowDayMon.format(utc(s)).replace(/,?\s(\d)/, ", $1");
/** "Sunday, 11 October" */
export const fmtLong = (s: string) => dLong.format(utc(s)).replace(/,?\s(\d)/, ", $1");
/** "October 2026" */
export const fmtMonth = (ym: string) => dMonth.format(utc(`${ym}-01`));
export const fmtMonthShort = (s: string) => dMonthShort.format(utc(s));
export const fmtWeekday = (s: string) => dWeekdayShort.format(utc(s));
export const fmtWeekdayLetter = (s: string) => dWeekdayNarrow.format(utc(s));

/** "14–16 Oct", or "30 Oct – 2 Nov" across months */
export const fmtRange = (a: string, b: string) => {
  const x = utc(a);
  const y = utc(b);
  if (x.getUTCMonth() === y.getUTCMonth()) return `${x.getUTCDate()}–${y.getUTCDate()} ${dMonthShort.format(y)}`;
  return `${fmtDay(a)} – ${fmtDay(b)}`;
};

/** "1 PM", "10:33 AM" */
export const fmtTime = (ts: string) => dTime.format(utc(ts)).replace(":00", "").replace(/ /g, " ");

/** "Today 10:33 AM", "Yesterday 6 PM", "9 Oct, 6:06 PM" */
export const fmtStamp = (ts: string) => {
  const day = ts.slice(0, 10);
  if (day === TODAY) return `Today, ${fmtTime(ts)}`;
  if (day === addDays(TODAY, -1)) return `Yesterday, ${fmtTime(ts)}`;
  if (day === addDays(TODAY, 1)) return `Tomorrow, ${fmtTime(ts)}`;
  return `${fmtDay(ts)}, ${fmtTime(ts)}`;
};

/** "Today", "Tomorrow", "Yesterday", or "Wed, 14 Oct" */
export const relDay = (s: string) => {
  const d = s.slice(0, 10);
  if (d === TODAY) return "Today";
  if (d === addDays(TODAY, 1)) return "Tomorrow";
  if (d === addDays(TODAY, -1)) return "Yesterday";
  return fmtDow(d);
};

/** "12 min ago", "2 hours ago", "3 days ago" relative to the frozen clock */
export const ago = (ts: string) => {
  const mins = Math.round((utc(NOW).getTime() - utc(ts).getTime()) / 6e4);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
};

/** "in 6 hours", "tomorrow at 10:33 AM" relative to the frozen clock */
export const until = (ts: string) => {
  const mins = Math.round((utc(ts).getTime() - utc(NOW).getTime()) / 6e4);
  if (mins < 60) return `in ${mins} min`;
  if (ts.slice(0, 10) === TODAY) return `today at ${fmtTime(ts)}`;
  if (ts.slice(0, 10) === addDays(TODAY, 1)) return `tomorrow at ${fmtTime(ts)}`;
  return `on ${fmtDay(ts)} at ${fmtTime(ts)}`;
};

/** "₹12,500" with Indian grouping */
export const inr = (n: number) => `₹${money.format(n)}`;
/** "₹2.7L", "₹54k" for tight spaces */
export const inrCompact = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(n >= 1000000 ? 0 : 1).replace(/\.0$/, "")}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
  return `₹${n}`;
};

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
export const nightsWord = (n: number) => plural(n, "night");
export const guestsWord = (n: number) => plural(n, "guest");

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const firstName = (name: string) => name.split(" ")[0];

/** Mon-first month grid: returns week start dates covering the month */
export const monthWeeks = (ym: string) => {
  const first = `${ym}-01`;
  const firstDow = (dow(first) + 6) % 7; // Monday = 0
  const [y, m] = ym.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const count = Math.ceil((firstDow + lastDay) / 7);
  const start = addDays(first, -firstDow);
  return Array.from({ length: count }, (_, i) => addDays(start, i * 7));
};

export const shiftMonth = (ym: string, delta: number) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};
