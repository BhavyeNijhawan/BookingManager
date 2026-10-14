"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { TODAY } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { addDays, dayOfMonth, firstName, fmtLong, fmtRange, inr, isWeekend, monthWeeks, nightsBetween, nightsWord } from "@/lib/format";
import { STATUS, channelName, itemsForUnit, moneyLine, unitName, type ChartItem } from "@/lib/selectors";
import type { UnitId } from "@/lib/types";
import { Tip } from "@/components/ui/bits";
import { StatusGlyph, barStyle } from "@/components/ui/status";
import { nightOccupant } from "@/components/bookings/availability";

const DOW = [
  ["M", "Mon"],
  ["T", "Tue"],
  ["W", "Wed"],
  ["T", "Thu"],
  ["F", "Fri"],
  ["S", "Sat"],
  ["S", "Sun"],
];

/**
 * One unit, one month, Monday first. Stays run from the middle of the check-in day to the middle of
 * the checkout day, like the stay chart, so turnovers read the same way in both views.
 */
export function MonthGrid({ month, unit, onDayClick }: { month: string; unit: UnitId; onDayClick: (date: string) => void }) {
  const bookings = useStore((s) => s.bookings);
  const blocks = useStore((s) => s.blocks);
  const weeks = monthWeeks(month);
  const name = unitName(unit);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div aria-hidden className="grid grid-cols-7 border-b border-line">
        {DOW.map(([letter, short], i) => (
          <span key={short} className={cn("py-2 text-center text-micro lg:px-3 lg:text-left", i >= 5 ? "bg-fill text-ink-2" : "text-ink-3")}>
            <span className="lg:hidden">{letter}</span>
            <span className="hidden lg:inline">{short}</span>
          </span>
        ))}
      </div>

      {weeks.map((ws, wi) => {
        const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
        // from the day before, so a stay that checks out on Monday morning still shows its last half-day
        const items = itemsForUnit(bookings, blocks, unit, addDays(ws, -1), addDays(ws, 7));
        return (
          <div key={ws} className={cn("relative", wi > 0 && "border-t border-line")}>
            <div className="grid grid-cols-7">
              {days.map((d, i) => {
                const inMonth = d.startsWith(month);
                const isToday = d === TODAY;
                const occ = nightOccupant(bookings, blocks, unit, d);
                const state =
                  occ?.kind === "booking" ? `${occ.booking.guest.name} staying` : occ?.kind === "block" ? `blocked, ${occ.block.reason}` : "open";
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDayClick(d)}
                    aria-label={`${fmtLong(d)}${isToday ? ", today" : ""}. ${name}: ${state}. Open the day`}
                    className={cn(
                      "flex h-[68px] flex-col items-center pt-1.5 transition-colors hover:bg-fill-2 lg:h-[88px] lg:items-start lg:px-2 lg:pt-2",
                      i > 0 && "border-l border-line/60",
                      isWeekend(d) && "bg-fill",
                    )}
                  >
                    <span
                      className={cn(
                        "tabular flex size-7 items-center justify-center rounded-full text-small",
                        isToday
                          ? "bg-ink font-medium text-paper"
                          : !inMonth
                            ? "text-ink-3 font-normal"
                            : d < TODAY
                              ? "text-ink-3"
                              : "font-medium text-ink",
                      )}
                    >
                      {dayOfMonth(d)}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* stays: a half-day grid so bars start and end mid-day */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-2.5 grid h-7 lg:bottom-3 lg:h-8"
              style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
            >
              {items.map((it) => (
                <WeekBar key={it.id} item={it} weekStart={ws} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeekBar({ item, weekStart }: { item: ChartItem; weekStart: string }) {
  const s = nightsBetween(weekStart, item.ci);
  const e = nightsBetween(weekStart, item.co);
  const contL = s < 0;
  const contR = e >= 7;
  const from = contL ? 1 : s * 2 + 2;
  const to = contR ? 15 : e * 2 + 2;
  if (to <= from) return null;
  const style: CSSProperties = { gridColumn: `${from} / ${to}`, gridRow: 1 };
  const shape = cn(
    "@container pointer-events-auto relative z-10 flex h-full min-w-0 items-center gap-1.5 overflow-hidden rounded-sm px-2 text-caption font-medium",
    contL && "rounded-l-none border-l-0",
    contR && "rounded-r-none border-r-0",
  );

  if (item.kind === "block") {
    const bl = item.block;
    return (
      <Tip
        content={
          <span className="block">
            <span className="block font-medium">Blocked</span>
            <span className="block text-ink-2">{bl.reason}</span>
            <span className="block text-ink-3">{fmtRange(bl.ci, bl.co)}, closed on every platform</span>
          </span>
        }
      >
        <button
          type="button"
          style={style}
          onClick={() => useStore.getState().openSheet({ kind: "block-info", id: bl.id })}
          aria-label={`Blocked ${fmtRange(bl.ci, bl.co)}: ${bl.reason}`}
          className={cn(shape, barStyle.block, "transition-opacity hover:opacity-80")}
        >
          <span className="truncate @max-[3.5rem]:hidden">Blocked</span>
        </button>
      </Tip>
    );
  }

  const b = item.booking;
  return (
    <Tip
      content={
        <span className="block">
          <span className="block font-medium">{b.guest.name}</span>
          <span className="block text-ink-2">
            {fmtRange(b.ci, b.co)}, {nightsWord(nightsBetween(b.ci, b.co))}
          </span>
          <span className="block text-ink-2">
            {channelName(b)}, {inr(b.amount)}
          </span>
          <span className="mt-1.5 flex items-center gap-1.5">
            <StatusGlyph mark={b.status} />
            {STATUS[b.status].label}
          </span>
          <span className="block text-ink-3">{moneyLine(b)}</span>
        </span>
      }
    >
      <Link
        href={`/bookings/${b.id}`}
        style={style}
        aria-label={`${b.guest.name}, ${fmtRange(b.ci, b.co)}, ${channelName(b)}, ${STATUS[b.status].label}`}
        className={cn(shape, barStyle[b.status], "transition-opacity duration-150 hover:opacity-85")}
      >
        <span className="truncate @max-[3.5rem]:hidden">{firstName(b.guest.name)}</span>
        <span className="truncate font-normal @max-[10rem]:hidden">{channelName(b)}</span>
      </Link>
    </Tip>
  );
}
