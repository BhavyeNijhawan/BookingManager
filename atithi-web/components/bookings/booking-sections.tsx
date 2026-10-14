"use client";

import Link from "next/link";
import { CircleAlert, ExternalLink, Moon } from "lucide-react";
import { cn } from "@/lib/cn";
import { CARETAKER, CHANNELS, TODAY } from "@/lib/seed";
import { openExtranet } from "@/lib/contact";
import { fmtDay, fmtDow, fmtLong, fmtStamp, fmtWeekday, guestsWord, inr, nightsWord, relDay } from "@/lib/format";
import {
  advanceOf,
  attentionReason,
  isLive,
  needsAction,
  nights,
  payMode,
  payout,
  platformSync,
  toCollect,
  unitName,
  verificationTrack,
  type SyncState,
} from "@/lib/selectors";
import type { Booking, Tone } from "@/lib/types";
import { Avatar, Stat } from "@/components/ui/bits";
import { SyncSeal } from "@/components/ui/status";
import { KeyValues, List, SectionHeader, Surface } from "@/components/ui/surface";
import { VerificationTrack } from "@/components/booking/verification-track";
import { checkoutTime } from "./availability";

/** "Today", "Tomorrow", or the weekday: short on phones, in full from 640px */
function DayWord({ d }: { d: string }) {
  const rel = relDay(d);
  if (!rel.includes(",")) return <>{rel}</>;
  return (
    <>
      <span className="sm:hidden">{fmtWeekday(d)}</span>
      <span className="hidden sm:inline">{fmtLong(d).split(",")[0]}</span>
    </>
  );
}

/* ---------- the stay, like a boarding pass ---------- */

export function StayPass({ b, className }: { b: Booking; className?: string }) {
  const n = nights(b);
  const facts: [string, string][] = [
    ["Unit", unitName(b.unit)],
    ["Guests", guestsWord(b.guest.pax)],
    ["Phone", b.guest.phone],
    ["Booked", b.tl[0] ? fmtStamp(b.tl[0].ts) : "Not recorded"],
  ];
  return (
    <section aria-label="Stay" className={className}>
      <Surface className="relative">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 px-4 pt-5 pb-5 sm:gap-4 lg:px-6 lg:pt-6">
          <div className="min-w-0">
            <p className="text-small text-ink-2">Check-in</p>
            <p className="mt-1 text-[1.375rem] leading-7 font-medium tracking-[-0.015em] text-ink lg:text-[1.625rem] lg:leading-8">
              {fmtDay(b.ci)}
            </p>
            <p className="mt-0.5 text-small text-ink-2">
              <DayWord d={b.ci} />, from 1 PM
            </p>
          </div>
          <div className="flex flex-col items-center pt-6 lg:pt-7">
            <span className="text-caption text-ink-2">{nightsWord(n)}</span>
            <span aria-hidden className="mt-1.5 flex w-14 items-center gap-1 text-ink-3 sm:w-24 lg:w-32">
              <span className="size-1.5 shrink-0 rounded-full bg-ink" />
              <span className="h-0 flex-1 border-t border-dashed border-ink/30" />
              <Moon className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span className="h-0 flex-1 border-t border-dashed border-ink/30" />
              <span className="size-1.5 shrink-0 rounded-full border border-ink" />
            </span>
          </div>
          <div className="min-w-0 text-right">
            <p className="text-small text-ink-2">Checkout</p>
            <p className="mt-1 text-[1.375rem] leading-7 font-medium tracking-[-0.015em] text-ink lg:text-[1.625rem] lg:leading-8">
              {fmtDay(b.co)}
            </p>
            <p className="mt-0.5 text-small text-ink-2">
              <DayWord d={b.co} />, by {checkoutTime(b)}
            </p>
          </div>
        </div>

        {/* perforation with two notches */}
        <div aria-hidden className="relative mx-4 border-t border-dashed border-line-2 lg:mx-6">
          <span className="absolute -top-[9.5px] -left-[25.5px] size-[18px] rounded-full border border-line bg-paper [clip-path:inset(0_0_0_calc(50%-1px))] lg:-left-[33.5px]" />
          <span className="absolute -top-[9.5px] -right-[25.5px] size-[18px] rounded-full border border-line bg-paper [clip-path:inset(0_calc(50%-1px)_0_0)] lg:-right-[33.5px]" />
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 px-4 pt-4 pb-5 sm:grid-cols-4 lg:px-6">
          {facts.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="text-caption text-ink-3">{k}</dt>
              <dd className="tabular mt-0.5 truncate text-small font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </Surface>
    </section>
  );
}

/* ---------- verification on WhatsApp ---------- */

export function VerificationSection({ b, className }: { b: Booking; className?: string }) {
  if (b.pay.mode !== "pay_at_property") return null;
  const steps = verificationTrack(b);
  // A booking confirmed by hand (a direct enquiry) never had the WhatsApp ask: the track would read as stuck.
  const settled = b.status === "confirmed" || b.status === "in_house" || b.status === "checked_out";
  const coherent = !(settled && steps[1].state !== "done");
  const adv = advanceOf(b);
  return (
    <section aria-labelledby="ver-h" className={className}>
      <SectionHeader id="ver-h" title="Verification" tone={needsAction(b) ? "alert" : "default"} />
      <Surface tone={needsAction(b) ? "alert" : "default"} className="p-4 lg:p-5">
        {coherent ? (
          <VerificationTrack booking={b} />
        ) : (
          <p className="text-small text-ink-2">
            Confirmed by you{adv?.status === "received" ? ` with the ${inr(adv.amount)} advance received` : ""}. No WhatsApp check was needed.
          </p>
        )}
        {needsAction(b) && (
          <p className="mt-4 flex gap-2 border-t border-line pt-4 text-small text-ink">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-alert" strokeWidth={2} />
            <span>{attentionReason(b)}</span>
          </p>
        )}
      </Surface>
    </section>
  );
}

/* ---------- money ---------- */

function advanceWords(b: Booking) {
  const adv = advanceOf(b);
  if (!adv) return null;
  if (adv.status === "received") return { v: `${inr(adv.amount)} paid` };
  if (adv.status === "link_sent") return { v: `${inr(adv.amount)}, link sent, unpaid`, tone: "alert" as const };
  if (adv.status === "not_paid") return { v: `${inr(adv.amount)}, never paid` };
  return { v: `${inr(adv.amount)}, link not sent yet`, tone: needsAction(b) ? ("alert" as const) : undefined };
}

export function MoneySection({ b, className }: { b: Booking; className?: string }) {
  const adv = advanceOf(b);
  const live = isLive(b) && b.status !== "checked_out";
  const paid = adv?.status === "received" ? adv.amount : 0;
  const n = nights(b);
  const rows: { k: string; v: string; tone?: "alert" }[] = [];
  if (b.pay.mode === "platform") {
    rows.push({ k: "Payout after commission", v: `about ${inr(payout(b))}` });
    rows.push({ k: "At check-in", v: "Nothing to collect" });
  } else {
    const a = advanceWords(b);
    if (a) rows.push({ k: "Advance", v: a.v, tone: live ? a.tone : undefined });
    rows.push({ k: "At check-in", v: b.status === "cancelled" ? "Nothing, cancelled" : `${inr(toCollect(b))} to collect` });
  }
  return (
    <section aria-labelledby="money-h" className={className}>
      <SectionHeader id="money-h" title="Money" />
      <Surface>
        <div className="p-4 lg:p-5">
          <Stat
            label="Total"
            value={inr(b.amount)}
            context={adv && live ? (paid > 0 ? `${inr(paid)} of ${inr(b.amount)} paid so far` : "Nothing paid yet") : `${payMode(b)}, ${nightsWord(n)}`}
            meter={adv && live ? { value: paid, max: b.amount, label: "Paid so far" } : undefined}
          />
        </div>
        <KeyValues className="border-t border-line lg:px-5" rows={[...(adv && live ? [{ k: "How it is paid", v: payMode(b) }] : []), ...rows]} />
      </Surface>
    </section>
  );
}

/* ---------- every platform ---------- */

const syncWord: Record<SyncState, string> = { source: "Source", blocked: "Blocked", updating: "Updating", open: "Open" };
const syncCell: Record<SyncState, string> = {
  source: "bg-ink",
  blocked: "bg-ink",
  updating: "border border-dashed border-accent",
  open: "border border-line-2",
};

export function PlatformsSection({ b, className }: { b: Booking; className?: string }) {
  const rows = platformSync(b);
  return (
    <section aria-labelledby="plat-h" className={className}>
      <SectionHeader id="plat-h" title="On every platform" action={<SyncSeal states={rows.map((r) => r.state)} />} />
      <Surface>
        <List>
          {rows.map((r) => (
            <div key={r.ch} className="flex items-start gap-3 px-4 py-3 lg:px-5">
              <span aria-hidden className={cn("mt-[7px] size-[7px] shrink-0 rounded-[2px]", syncCell[r.state])} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-medium text-ink">{CHANNELS[r.ch].name}</span>
                  <span className="shrink-0 text-small text-ink-2">{syncWord[r.state]}</span>
                </div>
                <p className="mt-0.5 text-caption text-ink-3">{r.detail}</p>
              </div>
            </div>
          ))}
        </List>
        {b.channel === "mmt" && isLive(b) && (
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 lg:px-5">
            <span className="text-caption text-ink-2">The same booking on the MakeMyTrip side</span>
            <button
              type="button"
              onClick={() => openExtranet("InGo-MMT")}
              className="-my-1 inline-flex shrink-0 items-center gap-1.5 rounded-sm py-1 text-small font-medium text-accent underline-offset-4 hover:underline"
            >
              Open on InGo-MMT
              <ExternalLink aria-hidden className="size-3.5" />
            </button>
          </div>
        )}
      </Surface>
    </section>
  );
}

/* ---------- notes ---------- */

export function NotesSection({ b, className }: { b: Booking; className?: string }) {
  if (!b.note) return null;
  return (
    <section aria-labelledby="notes-h" className={className}>
      <SectionHeader id="notes-h" title="Notes" />
      <Surface className="px-4 py-3.5 lg:px-5">
        <p className="text-body text-ink">{b.note}</p>
      </Surface>
    </section>
  );
}

/* ---------- what happened ---------- */

const dot: Record<Tone, string> = {
  good: "bg-ink",
  acc: "bg-ink/45",
  warn: "border-[1.5px] border-alert bg-surface",
  crit: "bg-alert",
  pend: "border-[1.5px] border-dashed border-ink/45 bg-surface",
};
const toneWord: Partial<Record<Tone, string>> = { warn: "Needs watching: ", crit: "Went wrong: " };

export function HistorySection({ b, className }: { b: Booking; className?: string }) {
  return (
    <section aria-labelledby="hist-h" className={className}>
      <SectionHeader id="hist-h" title="What happened" />
      <Surface className="px-4 py-5 lg:px-5">
        <ol>
          {b.tl.map((t, i) => {
            const last = i === b.tl.length - 1;
            return (
              <li key={i} className={cn("relative flex gap-3.5", !last && "pb-5")}>
                {!last && <span aria-hidden className="absolute top-4 -bottom-1 left-[4px] border-l-[1.5px] border-dotted border-ink/25" />}
                <span aria-hidden className={cn("relative mt-[7px] size-[10px] shrink-0 rounded-full", dot[t.tone])} />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-body", t.tone === "crit" ? "text-alert-ink" : t.tone === "pend" ? "text-ink-2" : "text-ink")}>
                    {toneWord[t.tone] && <span className="sr-only">{toneWord[t.tone]}</span>}
                    {t.tone === "pend" && <span className="font-medium text-ink">Next: </span>}
                    {t.text}
                  </p>
                  <p className="tabular mt-0.5 text-caption text-ink-3">{fmtStamp(t.ts)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Surface>
    </section>
  );
}

/* ---------- caretaker ---------- */

function caretakerLine(b: Booking) {
  const due = toCollect(b);
  if (b.status === "cancelled") return "Never had to prepare. The stay was cancelled before it reached the caretaker’s list.";
  if (b.status === "checked_out") return `Handled this stay. It left the caretaker’s list after checkout on ${fmtDay(b.co)}.`;
  if (needsAction(b)) return "Hears about this stay only once it is confirmed, so no room gets readied for a guest who will not come.";
  if (b.status === "in_house")
    return b.co === TODAY
      ? `Briefed at 8 AM today: checkout by ${checkoutTime(b)}, then cleaning.`
      : `The stay is on the caretaker’s list until checkout on ${fmtDow(b.co)}.`;
  if (b.ci === TODAY) return `Briefed at 8 AM today. Receives the guests after 1 PM${due > 0 ? ` and collects ${inr(due)}` : ""}.`;
  return `Gets this check-in in the Hindi briefing at 8 AM on ${fmtDow(b.ci)}${due > 0 ? `, with ${inr(due)} to collect` : ""}.`;
}

export function CaretakerSection({ b, className }: { b: Booking; className?: string }) {
  return (
    <section aria-labelledby="care-h" className={className}>
      <SectionHeader id="care-h" title="Caretaker" />
      <Surface>
        <div className="flex items-start gap-3 px-4 py-3.5 lg:px-5">
          <Avatar name={CARETAKER} size="sm" />
          <p className="min-w-0 flex-1 text-small text-ink-2">
            <span className="font-medium text-ink">{CARETAKER}</span> {caretakerLine(b)}
          </p>
        </div>
        <Link
          href="/caretaker"
          className="flex items-center justify-between border-t border-line px-4 py-3 text-small font-medium text-accent transition-colors last:rounded-b-[15px] hover:bg-fill lg:px-5"
        >
          Open caretaker view
        </Link>
      </Surface>
    </section>
  );
}
