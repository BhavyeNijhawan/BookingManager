"use client";

import Link from "next/link";
import { Clock, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { CARETAKER, TODAY } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { addDays, fmtDay, fmtTime, relDay } from "@/lib/format";
import { scheduledSends, type Scheduled } from "@/lib/selectors";
import { Button } from "@/components/ui/button";
import { EmptyState, List, Surface } from "@/components/ui/surface";
import { keepHyphens } from "./keep-hyphens";
import { sendKey, useSkipped } from "./skipped";

/** Count of sends still going out, for the view switch */
export function usePendingCount() {
  const bookings = useStore((s) => s.bookings);
  const skipped = useSkipped((s) => s.keys);
  return scheduledSends(bookings).filter((s) => !skipped.includes(sendKey(s))).length;
}

/**
 * Everything Atithi will send next, grouped by day, each with "Skip".
 * `pane` is the laptop conversation column, `page` the phone screen.
 */
export function ScheduleList({ variant }: { variant: "pane" | "page" }) {
  const bookings = useStore((s) => s.bookings);
  const sends = scheduledSends(bookings);

  // One group per day for the coming week, then everything after it under "Later".
  const weekEnd = addDays(TODAY, 7);
  const days: { day: string; label: string; items: Scheduled[] }[] = [];
  for (const s of sends) {
    const date = s.ts.slice(0, 10);
    const day = date < weekEnd ? date : "later";
    const last = days[days.length - 1];
    if (last?.day === day) last.items.push(s);
    else days.push({ day, label: day === "later" ? "Later" : relDay(date), items: [s] });
  }

  const pane = variant === "pane";

  if (!sends.length)
    return <EmptyState icon={<Clock aria-hidden />} title="Nothing scheduled" description="New reminders and check-in details appear here before they go out." />;

  return (
    <div className={cn("flex flex-col", pane ? "gap-6 px-2" : "gap-7")}>
      {days.map(({ day, label, items }) => {
        const rows = items.map((s) => <SendRow key={sendKey(s)} send={s} pane={pane} dated={day === "later"} />);
        return (
          <section key={day} aria-labelledby={`send-${variant}-${day}`}>
            <h2
              id={`send-${variant}-${day}`}
              className={cn("mb-2 flex items-center gap-2 text-small font-medium text-ink", pane ? "px-3" : "px-1")}
            >
              {label}
              <span className="tabular font-normal text-ink-3">{items.length}</span>
            </h2>
            {pane ? (
              <div className="flex flex-col">{rows}</div>
            ) : (
              <Surface>
                <List>{rows}</List>
              </Surface>
            )}
          </section>
        );
      })}
      <p className={cn("text-small text-ink-2", pane ? "px-3" : "px-1")}>
        This is everything Atithi will send next, so nothing goes out that you did not expect. Skip any of them, or reply
        to the guest yourself and the pending reminder is dropped.
      </p>
    </div>
  );
}

/** The rule line repeats the message for some rules ("Thank-you and review request"); drop it then. */
const sameWords = (a: string, b: string) => {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x.startsWith(y) || y.startsWith(x);
};

function SendRow({ send: s, pane, dated }: { send: Scheduled; pane: boolean; dated: boolean }) {
  const autos = useStore((st) => st.autos);
  const skipScheduled = useStore((st) => st.skipScheduled);
  const key = sendKey(s);
  const skipped = useSkipped((st) => st.keys.includes(key));
  const toggle = useSkipped((st) => st.toggle);
  const who = s.booking ? s.booking.guest.name : CARETAKER;
  const rule = autos.find((a) => a.name === s.rule);

  return (
    <div className={cn("flex items-start gap-3", pane ? "rounded-lg px-3 py-2.5" : "px-4 py-3.5")}>
      <span className={cn("tabular flex w-[4.25rem] shrink-0 flex-col pt-px text-small font-medium", skipped ? "text-ink-3" : "text-ink")}>
        {dated && <span>{fmtDay(s.ts)}</span>}
        <span className={cn(dated && "text-caption font-normal text-ink-2")}>{fmtTime(s.ts)}</span>
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-small", skipped ? "text-ink-3 line-through decoration-ink/30" : "text-ink")}>{s.what}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-caption text-ink-2">
          <span>{who}</span>
          {sameWords(s.what, s.rule) ? null : rule ? (
            <Link
              href={`/more/automations/${rule.id}`}
              className="inline-flex items-start gap-1 rounded-sm underline-offset-2 hover:text-ink hover:underline"
            >
              <Zap aria-hidden className="mt-0.5 size-3 shrink-0" strokeWidth={2} />
              <span>{keepHyphens(s.rule)}</span>
            </Link>
          ) : (
            <span className="inline-flex items-start gap-1">
              <Zap aria-hidden className="mt-0.5 size-3 shrink-0" strokeWidth={2} />
              {s.rule}
            </span>
          )}
        </p>
        {skipped && <p className="mt-1 text-caption text-ink-2">Skipped. It will not go out.</p>}
      </div>
      {skipped ? (
        <Button variant="ghost" size="sm" className="-my-1 -mr-2 text-accent" aria-label={`Undo skip: ${s.what}, ${who}`} onClick={() => toggle(key)}>
          Undo
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="-my-1 -mr-2 text-ink-2 hover:text-ink"
          aria-label={`Skip: ${s.what}, ${who}`}
          onClick={() => {
            toggle(key);
            skipScheduled(s.what);
          }}
        >
          Skip
        </Button>
      )}
    </div>
  );
}
