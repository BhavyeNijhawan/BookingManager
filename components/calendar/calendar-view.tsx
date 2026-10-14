"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarOff, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { PROPERTY, TODAY, UNITS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { dayOfMonth, fmtMonth, shiftMonth } from "@/lib/format";
import type { UnitId } from "@/lib/types";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Button, IconButton } from "@/components/ui/button";
import { Segmented } from "@/components/ui/bits";
import { SectionHeader } from "@/components/ui/surface";
import { StayChart, StayLegend } from "@/components/booking/stay-chart";
import { calendarHref } from "./href";
import { MonthGrid } from "./month-grid";
import { MonthSummary, daysInMonth } from "./month-summary";

const THIS_MONTH = TODAY.slice(0, 7);

const parseMonth = (v: string | null) => {
  if (!v || !/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) return THIS_MONTH;
  return v;
};
const parseUnit = (v: string | null): UnitId => (UNITS.some((u) => u.id === v) ? (v as UnitId) : UNITS[0].id);

const subscribeWide = (cb: () => void) => {
  const m = window.matchMedia("(min-width: 1024px)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useWide = () =>
  useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );

/** Reads the month and unit from the URL. Needs a Suspense boundary above it. */
export function CalendarFromUrl() {
  const sp = useSearchParams();
  return <CalendarView month={parseMonth(sp.get("month"))} unit={parseUnit(sp.get("unit"))} />;
}

export function CalendarView({ month, unit }: { month: string; unit: UnitId }) {
  const openSheet = useStore((s) => s.openSheet);
  const wide = useWide();
  const days = daysInMonth(month);
  const label = fmtMonth(month);
  const monthName = label.split(" ")[0];
  const openDay = (date: string) => openSheet({ kind: "day", date });

  // On phones the month is wider than the screen: start the chart at yesterday.
  const chartWrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroller = chartWrap.current?.querySelector<HTMLElement>(".overflow-x-auto");
    if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;
    const idx = month === THIS_MONTH ? Math.max(0, dayOfMonth(TODAY) - 2) : 0;
    const labelW = wide ? 148 : 104;
    scroller.scrollLeft = idx * ((scroller.scrollWidth - labelW) / days);
  }, [month, wide, days]);

  const actions = (
    <>
      <Button variant="secondary" icon={<CalendarOff aria-hidden />} onClick={() => openSheet({ kind: "block" })}>
        Block dates
      </Button>
      <Button variant="primary" icon={<Plus aria-hidden />} onClick={() => openSheet({ kind: "direct" })}>
        Add booking
      </Button>
    </>
  );
  const mobileActions = (
    <>
      <Button variant="ghost" size="sm" className="text-accent" onClick={() => openSheet({ kind: "block" })}>
        Block
      </Button>
      <IconButton label="Add a direct booking" onClick={() => openSheet({ kind: "direct" })} className="text-accent">
        <Plus aria-hidden strokeWidth={2} />
      </IconButton>
    </>
  );

  return (
    <>
      <PageHeader kicker={PROPERTY} title="Calendar" actions={actions} mobileActions={mobileActions} />
      <PageBody>
        <section aria-labelledby="month-h">
          <MonthNav month={month} unit={unit} label={label} />
          <div ref={chartWrap} className="mt-4">
            <StayChart
              start={`${month}-01`}
              days={days}
              minDayWidth={wide ? 30 : 36}
              onDayClick={openDay}
              caption={`Stays for both units in ${label}`}
            />
          </div>
          <StayLegend className="mt-3" />
        </section>

        <div className="mt-10 grid gap-x-10 gap-y-9 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section aria-labelledby="grid-h" className="min-w-0">
            <SectionHeader id="grid-h" title={`${monthName}, one unit at a time`} />
            <Segmented
              label="Unit"
              value={unit}
              items={UNITS.map((u) => ({ value: u.id, label: u.name, href: calendarHref(month, u.id) }))}
              className="mb-3"
            />
            <MonthGrid month={month} unit={unit} onDayClick={openDay} />
          </section>
          <aside className="min-w-0" aria-label="Month summary">
            <MonthSummary month={month} monthName={monthName} />
          </aside>
        </div>
      </PageBody>
    </>
  );
}

const navBtn =
  "inline-flex size-10 items-center justify-center rounded-md border border-line-2 bg-surface text-ink transition-[background-color,border-color] duration-150 hover:border-ink/25 hover:bg-fill [&_svg]:size-[18px]";

function MonthNav({ month, unit, label }: { month: string; unit: UnitId; label: string }) {
  const prev = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);
  return (
    <nav aria-label="Month" className="flex items-center justify-between gap-3">
      <h2 id="month-h" className="text-heading font-medium text-ink lg:text-[1.1875rem] lg:leading-7" aria-live="polite">
        {label}
      </h2>
      <div className="flex items-center gap-2">
        {month !== THIS_MONTH && (
          <Link
            href={calendarHref(THIS_MONTH, unit)}
            scroll={false}
            className="inline-flex h-10 items-center rounded-md px-3 text-small font-medium text-accent hover:bg-accent-soft"
          >
            This month
          </Link>
        )}
        <Link href={calendarHref(prev, unit)} scroll={false} aria-label={`Previous month, ${fmtMonth(prev)}`} className={navBtn}>
          <ChevronLeft aria-hidden strokeWidth={1.75} />
        </Link>
        <Link href={calendarHref(next, unit)} scroll={false} aria-label={`Next month, ${fmtMonth(next)}`} className={cn(navBtn)}>
          <ChevronRight aria-hidden strokeWidth={1.75} />
        </Link>
      </div>
    </nav>
  );
}
