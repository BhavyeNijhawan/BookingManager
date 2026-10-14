"use client";

import { ArrowLeftRight } from "lucide-react";
import { TODAY, UNITS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { addDays, dayOfMonth, dow, fmtMonthShort, nightsWord } from "@/lib/format";
import type { Block, Booking, UnitId } from "@/lib/types";
import { List, SectionHeader, Surface } from "@/components/ui/surface";
import { listJoin, nightOccupant } from "@/components/bookings/availability";

export function daysInMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function unitMonth(bookings: Booking[], blocks: Block[], unit: UnitId, month: string) {
  const dim = daysInMonth(month);
  let booked = 0;
  let blocked = 0;
  let open = 0;
  const weekendOpen: string[] = [];
  for (let i = 0; i < dim; i++) {
    const d = addDays(`${month}-01`, i);
    const occ = nightOccupant(bookings, blocks, unit, d);
    if (occ?.kind === "booking") booked++;
    else if (occ?.kind === "block") blocked++;
    else {
      open++;
      // Friday and Saturday nights are what sell in a weekend town
      const wd = dow(d);
      if (d >= TODAY && (wd === 5 || wd === 6)) weekendOpen.push(d);
    }
  }
  return { dim, booked, blocked, open, weekendOpen };
}

/** Booked, blocked and open nights per unit for the month, and which weekend nights can still sell. */
export function MonthSummary({ month, monthName }: { month: string; monthName: string }) {
  const bookings = useStore((s) => s.bookings);
  const blocks = useStore((s) => s.blocks);
  const past = `${month}-${String(daysInMonth(month)).padStart(2, "0")}` < TODAY;

  return (
    <section aria-labelledby="sum-h">
      <SectionHeader id="sum-h" title={`${monthName} at a glance`} />
      <Surface>
        <List>
          {UNITS.map((u) => {
            const n = unitMonth(bookings, blocks, u.id, month);
            const pct = Math.round((n.booked / n.dim) * 100);
            const figures: [string, number][] = [
              ["Booked", n.booked],
              ["Blocked", n.blocked],
              ["Open", n.open],
            ];
            return (
              <div key={u.id} className="px-4 py-4 lg:px-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="truncate font-medium text-ink">{u.name}</h3>
                  <span className="tabular shrink-0 text-small text-ink-2">{pct}% booked</span>
                </div>
                <span
                  role="meter"
                  aria-label={`${u.name}, nights booked in ${monthName}`}
                  aria-valuenow={n.booked}
                  aria-valuemin={0}
                  aria-valuemax={n.dim}
                  className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-fill-2"
                >
                  <span className="block h-full bg-ink" style={{ width: `${(n.booked / n.dim) * 100}%` }} />
                  {n.blocked > 0 && <span className="block h-full bg-ink/25" style={{ width: `${(n.blocked / n.dim) * 100}%` }} />}
                </span>
                <dl className="mt-3 grid grid-cols-3 gap-2">
                  {figures.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-caption text-ink-3">{k}</dt>
                      <dd className="tabular text-small font-medium text-ink">{nightsWord(v)}</dd>
                    </div>
                  ))}
                </dl>
                {!past && (
                  <p className="mt-3 text-small text-ink-2">
                    {n.weekendOpen.length === 0 ? (
                      "Every Friday and Saturday night left is taken."
                    ) : (
                      <>
                        <span className="text-ink">Friday and Saturday nights still open:</span>{" "}
                        <span className="tabular">
                          {listJoin(n.weekendOpen.map((d) => String(dayOfMonth(d))))} {fmtMonthShort(n.weekendOpen[0])}
                        </span>
                      </>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </List>
        <p className="flex items-start gap-2 border-t border-line px-4 py-3 text-caption text-ink-2 lg:px-5">
          <ArrowLeftRight aria-hidden className="mt-px size-3.5 shrink-0" />
          One booking closes the night on Airbnb, Booking.com, Agoda and MakeMyTrip within minutes. Tap any date to see each unit, or to
          block it.
        </p>
      </Surface>
    </section>
  );
}

