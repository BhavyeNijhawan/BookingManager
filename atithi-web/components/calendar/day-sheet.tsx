"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { TODAY, UNITS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { fmtLong, fmtRange, nightsBetween, nightsWord } from "@/lib/format";
import { channelName, isLive } from "@/lib/selectors";
import { Button } from "@/components/ui/button";
import { StatusMark } from "@/components/ui/status";
import { SheetActions, SheetClose, SheetHeader } from "@/components/ui/sheet";
import { checkoutTime, nightOccupant, otherPlatforms } from "@/components/bookings/availability";

/** One night, both units: who has it, what blocks it, or what is still bookable. */
export function DaySheet({ date }: { date: string }) {
  const bookings = useStore((s) => s.bookings);
  const blocks = useStore((s) => s.blocks);
  const openSheet = useStore((s) => s.openSheet);
  const unblock = useStore((s) => s.unblock);
  const past = date < TODAY;
  const rows = UNITS.map((u) => ({ unit: u, occ: nightOccupant(bookings, blocks, u.id, date) }));
  const anyOpen = rows.some((r) => !r.occ);

  return (
    <>
      <SheetHeader
        title={`${fmtLong(date)}${date === TODAY ? ", today" : ""}`}
        description={past ? "This night has passed." : "Tap a booking to open it, or block a unit that is still open."}
      />

      <ul className="flex flex-col gap-3">
        {rows.map(({ unit, occ }) => {
          const leaving = bookings.find((b) => b.unit === unit.id && isLive(b) && b.co === date);
          const morning = leaving && (
            <p className="mt-2 text-caption text-ink-3">
              {leaving.guest.name} {leaving.status === "checked_out" ? "checked out" : "checks out"} that morning, by {checkoutTime(leaving)}.
            </p>
          );

          if (occ?.kind === "booking") {
            const b = occ.booking;
            return (
              <li key={unit.id}>
                <Link
                  href={`/bookings/${b.id}`}
                  className="group block rounded-lg border border-line p-4 transition-[background-color,border-color] duration-150 hover:border-line-2 hover:bg-fill"
                >
                  <UnitLine name={unit.name} state="Booked" />
                  <span className="mt-2 flex items-center justify-between gap-3">
                    <span className="truncate text-body font-medium text-ink group-hover:underline group-hover:underline-offset-4">
                      {b.guest.name}
                    </span>
                    <ChevronRight aria-hidden className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-0.5 block text-small text-ink-2">
                    {fmtRange(b.ci, b.co)}, {nightsWord(nightsBetween(b.ci, b.co))}, {channelName(b)}
                  </span>
                  <StatusMark status={b.status} className="mt-1.5" />
                  <span className="mt-2 block text-caption text-ink-3">
                    {`${past ? "Was closed" : "Closed"} on ${b.channel === "direct" ? "all four platforms" : otherPlatforms(b)}`}
                  </span>
                  {morning}
                </Link>
              </li>
            );
          }

          if (occ?.kind === "block") {
            const bl = occ.block;
            return (
              <li key={unit.id} className="rounded-lg border border-line p-4">
                <UnitLine name={unit.name} state="Blocked" />
                <p className="mt-2 text-body font-medium text-ink">{bl.reason}</p>
                <p className="mt-0.5 text-small text-ink-2">
                  {fmtRange(bl.ci, bl.co)}, closed on all four platforms
                </p>
                {morning}
                {!past && (
                  <Button size="sm" variant="secondary" className="mt-3" onClick={() => unblock(bl.id)}>
                    Unblock
                  </Button>
                )}
              </li>
            );
          }

          return (
            <li key={unit.id} className="rounded-lg border border-dashed border-line-2 p-4">
              <UnitLine name={unit.name} state="Open" />
              <p className="mt-2 text-small text-ink-2">{past ? "Nobody stayed this night." : "Bookable on all four platforms."}</p>
              {morning}
              {!past && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={() => openSheet({ kind: "block", unit: unit.id, date })}
                >
                  Block
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <SheetActions>
        <SheetClose asChild>
          <Button variant="secondary" className={cn(!past && anyOpen && "lg:hidden")}>
            Close
          </Button>
        </SheetClose>
        {!past && anyOpen && (
          <Button variant="primary" onClick={() => openSheet({ kind: "direct", date })}>
            Add a direct booking for this night
          </Button>
        )}
      </SheetActions>
    </>
  );
}

function UnitLine({ name, state }: { name: string; state: string }) {
  return (
    <span className="flex items-center justify-between gap-3 text-small">
      <span className="font-medium text-ink-2">{name}</span>
      <span className="text-ink-3">{state}</span>
    </span>
  );
}
