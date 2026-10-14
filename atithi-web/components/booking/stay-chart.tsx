"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { NOW, TODAY, UNITS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { addDays, dayOfMonth, firstName, initials, fmtLong, fmtMonthShort, fmtRange, fmtWeekdayLetter, inr, isWeekend, nightsBetween, nightsWord } from "@/lib/format";
import { STATUS, channelName, itemsForUnit, moneyLine, type ChartItem } from "@/lib/selectors";
import type { UnitId } from "@/lib/types";
import { Tip } from "@/components/ui/bits";
import { StatusGlyph, barStyle, type Mark } from "@/components/ui/status";

const nowFraction = (() => {
  const [h, m] = NOW.slice(11, 16).split(":").map(Number);
  return (h * 60 + m) / (24 * 60);
})();

/**
 * Hotel-style tape chart. Each stay runs from the middle of its check-in day to the middle of its
 * checkout day, so turnover days read at a glance. Weekends are shaded; today carries a "now" line.
 */
export function StayChart({
  start,
  days,
  units = UNITS.map((u) => u.id),
  onDayClick,
  minDayWidth = 46,
  className,
  caption,
}: {
  start: string;
  days: number;
  units?: UnitId[];
  onDayClick?: (date: string) => void;
  minDayWidth?: number;
  className?: string;
  caption: string;
}) {
  const bookings = useStore((s) => s.bookings);
  const blocks = useStore((s) => s.blocks);
  const end = addDays(start, days);
  const dates = Array.from({ length: days }, (_, i) => addDays(start, i));
  const todayIdx = dates.indexOf(TODAY);

  const grid: CSSProperties = {
    gridTemplateColumns: `var(--label-w) repeat(${days}, minmax(${minDayWidth}px, 1fr))`,
  };

  return (
    <figure className={cn("overflow-hidden rounded-xl border border-line bg-surface", className)}>
      <figcaption className="sr-only">{caption}</figcaption>
      <div className="scrollbar-none overflow-x-auto overscroll-x-contain">
        <div className="relative grid w-max min-w-full [--label-w:104px] lg:[--label-w:148px]" style={grid}>
          {/* header row */}
          <div className="sticky left-0 z-20 flex items-end border-r border-b border-line bg-surface px-3 pb-3 text-caption text-ink-3 lg:px-4">
            {fmtMonthShort(start)}
            {fmtMonthShort(start) !== fmtMonthShort(addDays(start, days - 1)) && `–${fmtMonthShort(addDays(start, days - 1))}`}
          </div>
          {dates.map((d, i) => {
            const isToday = d === TODAY;
            const weekend = isWeekend(d);
            const content = (
              <>
                <span className={cn("text-micro", weekend ? "text-ink-2" : "text-ink-3")}>{fmtWeekdayLetter(d)}</span>
                <span
                  className={cn(
                    "tabular mt-1 flex size-7 items-center justify-center rounded-full text-small font-medium",
                    isToday ? "bg-ink text-paper" : d < TODAY ? "text-ink-3" : "text-ink",
                  )}
                >
                  {dayOfMonth(d)}
                </span>
              </>
            );
            const cls = cn(
              "flex flex-col items-center border-b border-line pt-2.5 pb-2",
              i > 0 && "border-l border-l-line/60",
              weekend && "bg-fill",
            );
            return onDayClick ? (
              <button
                key={d}
                type="button"
                onClick={() => onDayClick(d)}
                aria-label={`${fmtLong(d)}${isToday ? ", today" : ""}. Open the day`}
                className={cn(cls, "transition-colors hover:bg-fill-2")}
              >
                {content}
              </button>
            ) : (
              <div key={d} className={cls} aria-hidden>
                {content}
              </div>
            );
          })}

          {/* one row per unit */}
          {units.map((u, row) => {
            const unit = UNITS.find((x) => x.id === u)!;
            // From the day before, so a stay that checks out on the first day still shows its morning half.
            const items = itemsForUnit(bookings, blocks, u, addDays(start, -1), end);
            return (
              <div key={u} className="contents">
                <div
                  className={cn(
                    "sticky left-0 z-20 flex flex-col justify-center border-r border-line bg-surface px-3 lg:px-4",
                    row > 0 && "border-t border-t-line",
                  )}
                >
                  <span className="truncate text-small font-medium text-ink">{unit.name}</span>
                  <span className="hidden truncate text-caption text-ink-3 lg:block">{unit.meta.split(",")[0]}</span>
                </div>
                <div className={cn("relative h-[60px]", row > 0 && "border-t border-line")} style={{ gridColumn: `2 / span ${days}` }}>
                  {/* day columns: weekend shading and hairlines */}
                  <div aria-hidden className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${days}, 1fr)` }}>
                    {dates.map((d, i) => (
                      <span key={d} className={cn(i > 0 && "border-l border-line/60", isWeekend(d) && "bg-fill")} />
                    ))}
                  </div>
                  {/* now line */}
                  {todayIdx >= 0 && (
                    <span
                      aria-hidden
                      className="absolute top-0 bottom-0 z-[5] w-[1.5px] -translate-x-1/2 bg-accent"
                      style={{ left: `${((todayIdx + nowFraction) / days) * 100}%` }}
                    >
                      {row === 0 && <span className="absolute -top-[3px] left-1/2 size-[7px] -translate-x-1/2 rounded-full bg-accent" />}
                    </span>
                  )}
                  {/* stays: half-day grid so bars start and end mid-day */}
                  <div className="absolute inset-0 grid items-center py-3" style={{ gridTemplateColumns: `repeat(${days * 2}, 1fr)` }}>
                    {items.map((it) => (
                      <Bar key={it.id} item={it} start={start} days={days} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </figure>
  );
}

function Bar({ item, start, days }: { item: ChartItem; start: string; days: number }) {
  const s = nightsBetween(start, item.ci);
  const e = nightsBetween(start, item.co);
  const from = s < 0 ? 1 : s * 2 + 2;
  const to = e >= days ? days * 2 + 1 : e * 2 + 2;
  if (to <= from) return null;
  const contL = s < 0;
  const contR = e >= days;
  const style: CSSProperties = { gridColumn: `${from} / ${to}`, gridRow: 1 };
  const shape = cn(
    "@container relative z-10 flex h-9 min-w-0 items-center gap-1.5 overflow-hidden rounded-sm px-2 text-caption font-medium",
    contL && "rounded-l-none border-l-0",
    contR && "rounded-r-none border-r-0",
  );

  if (item.kind === "block") {
    const bl = item.block;
    return (
      <Tip content={<BlockTip reason={bl.reason} ci={bl.ci} co={bl.co} />}>
        <button
          type="button"
          style={style}
          onClick={() => useStore.getState().openSheet({ kind: "block-info", id: bl.id })}
          aria-label={`Blocked ${fmtRange(bl.ci, bl.co)}: ${bl.reason}`}
          className={cn(shape, barStyle.block, "transition-opacity hover:opacity-80")}
        >
          <span className="truncate @max-[4.5rem]:hidden">Blocked</span>
        </button>
      </Tip>
    );
  }

  const b = item.booking;
  const mark: Mark = b.status;
  return (
    <Tip
      content={
        <span className="block">
          <span className="block font-medium">{b.guest.name}</span>
          <span className="block text-ink-2">
            {fmtRange(b.ci, b.co)}, {nightsWord(nightsBetween(b.ci, b.co))}
          </span>
          <span className="block text-ink-2">{channelName(b)}, {inr(b.amount)}</span>
          <span className="mt-1.5 flex items-center gap-1.5">
            <StatusGlyph mark={mark} />
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
        className={cn(shape, barStyle[mark], "transition-opacity duration-150 hover:opacity-85")}
      >
        <span className="truncate @max-[4.25rem]:hidden">{firstName(b.guest.name)}</span>
        <span aria-hidden className="hidden tracking-wide @max-[4.25rem]:inline @max-[1.6rem]:hidden">{initials(b.guest.name)}</span>
        <span className="truncate font-normal @max-[9rem]:hidden">{channelName(b)}</span>
      </Link>
    </Tip>
  );
}

function BlockTip({ reason, ci, co }: { reason: string; ci: string; co: string }) {
  return (
    <span className="block">
      <span className="block font-medium">Blocked</span>
      <span className="block text-ink-2">{reason}</span>
      <span className="block text-ink-3">
        {fmtRange(ci, co)}, closed on every platform
      </span>
    </span>
  );
}

/** Legend for the stay chart. Glyphs are the same shapes as the bars. */
export function StayLegend({ className }: { className?: string }) {
  const items: { mark: Mark; label: string }[] = [
    { mark: "in_house", label: "Staying now" },
    { mark: "confirmed", label: "Confirmed" },
    { mark: "unverified", label: "Not verified" },
    { mark: "flagged", label: "Likely fake" },
    { mark: "block", label: "Blocked" },
  ];
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-caption text-ink-2", className)}>
      {items.map((it) => (
        <li key={it.mark} className="inline-flex items-center gap-2">
          <StatusGlyph mark={it.mark} className="h-2.5 w-4" />
          {it.label}
        </li>
      ))}
      <li className="inline-flex items-center gap-2">
        <span aria-hidden className="h-2.5 w-4 rounded-[3px] bg-fill-2" />
        Weekend
      </li>
      <li className="inline-flex items-center gap-2">
        <span aria-hidden className="h-3 w-[1.5px] bg-accent" />
        Now
      </li>
    </ul>
  );
}
