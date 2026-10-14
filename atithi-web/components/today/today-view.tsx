"use client";

import Link from "next/link";
import { ArrowLeftRight, BedDouble, Clock, LogIn, LogOut, Play, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { CARETAKER, CHANNEL_CONFIG, CHANNELS, TODAY } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { addDays, fmtLong, fmtMonth, fmtTime, firstName, guestsWord, inr, relDay } from "@/lib/format";
import {
  byCheckIn,
  monthNumbers,
  moneyShort,
  needsAction,
  scheduledSends,
  todaysMovements,
  unitName,
  type Movement,
} from "@/lib/selectors";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Button, IconButton } from "@/components/ui/button";
import { Avatar, Stat } from "@/components/ui/bits";
import { List, SectionHeader, SectionLink, Surface } from "@/components/ui/surface";
import { AttentionCard } from "@/components/booking/attention-card";
import { StayChart, StayLegend } from "@/components/booking/stay-chart";

function daySentence(moves: Movement[]) {
  const outs = moves.filter((m) => m.kind === "out" && m.booking.status !== "checked_out");
  const ins = moves.filter((m) => m.kind === "in" && m.booking.status === "confirmed");
  const parts: string[] = [];
  if (outs.length) parts.push(`${outs.map((m) => firstName(m.booking.guest.name)).join(" and ")} ${outs.length > 1 ? "leave" : "leaves"} at ${outs[0].time}`);
  if (ins.length) parts.push(`${ins.map((m) => firstName(m.booking.guest.name)).join(" and ")} ${ins.length > 1 ? "arrive" : "arrives"} after ${ins[0].time}`);
  if (!parts.length) return "No arrivals or departures left today.";
  return `${parts.join(", and ")}. Everything else is on track.`;
}

export function TodayView() {
  const bookings = useStore((s) => s.bookings);
  const openSheet = useStore((s) => s.openSheet);
  const need = bookings.filter(needsAction).sort(byCheckIn);
  const moves = todaysMovements(bookings);
  const title = need.length === 0 ? "Nothing needs you today" : need.length === 1 ? "1 booking needs you" : `${need.length} bookings need you`;

  const actions = (
    <>
      <Button variant="secondary" icon={<Play aria-hidden />} onClick={() => openSheet({ kind: "demo" })}>
        Run the demo
      </Button>
      <Button variant="primary" icon={<Plus aria-hidden />} onClick={() => openSheet({ kind: "add" })}>
        Add booking
      </Button>
    </>
  );
  const mobileActions = (
    <>
      <Button variant="ghost" size="sm" className="text-accent" onClick={() => openSheet({ kind: "demo" })}>
        Demo
      </Button>
      <IconButton label="Add a booking or block dates" onClick={() => openSheet({ kind: "add" })} className="text-accent">
        <Plus aria-hidden strokeWidth={2} />
      </IconButton>
    </>
  );

  return (
    <>
      <PageHeader kicker={fmtLong(TODAY)} title={title} description={daySentence(moves)} actions={actions} mobileActions={mobileActions} />
      <PageBody>
        <div className="grid gap-x-10 gap-y-9 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-9">
            {need.length > 0 && (
              <section aria-labelledby="need-h">
                <SectionHeader id="need-h" title="Needs your attention" count={need.length} tone="alert" />
                <div className="flex flex-col gap-3">
                  {need.map((b) => (
                    <AttentionCard key={b.id} booking={b} />
                  ))}
                </div>
              </section>
            )}
            <TodaySection moves={moves} />
          </div>

          <aside className="flex min-w-0 flex-col gap-9" aria-label="Summary">
            <MonthSection />
            <PlatformsSection />
            <OutgoingSection />
          </aside>
        </div>

        <section aria-labelledby="chart-h" className="mt-10">
          <SectionHeader id="chart-h" title="Next two weeks" action={<SectionLink href="/calendar">Open calendar</SectionLink>} />
          <StayChart
            start={addDays(TODAY, -1)}
            days={14}
            onDayClick={(date) => openSheet({ kind: "day", date })}
            caption="Stays for both units over the next two weeks"
          />
          <StayLegend className="mt-3" />
        </section>
      </PageBody>
    </>
  );
}

/* ---------- today: leaving, arriving, staying ---------- */

function TodaySection({ moves }: { moves: Movement[] }) {
  const checkIn = useStore((s) => s.checkIn);
  const checkOut = useStore((s) => s.checkOut);
  return (
    <section aria-labelledby="today-h">
      <SectionHeader id="today-h" title="Today at the property" />
      <Surface>
        {moves.length === 0 ? (
          <p className="px-4 py-5 text-small text-ink-2">No arrivals or departures today.</p>
        ) : (
          <List>
            {moves.map((m) => {
              const b = m.booking;
              const done = (m.kind === "out" && b.status === "checked_out") || (m.kind === "in" && b.status === "in_house");
              const Icon = m.kind === "out" ? LogOut : m.kind === "in" ? LogIn : BedDouble;
              const verb = m.kind === "out" ? (done ? "left" : "leaves") : m.kind === "in" ? (done ? "arrived" : "arrives") : `stays till ${relDay(b.co).replace(/^\w+, /, "")}`;
              return (
                <div key={`${m.kind}-${b.id}`} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex w-14 shrink-0 flex-col">
                    <span className="tabular text-small font-medium text-ink">{m.time || "Now"}</span>
                    <span className="text-caption text-ink-3">{m.kind === "out" ? "Checkout" : m.kind === "in" ? "Check-in" : "Staying"}</span>
                  </div>
                  <span aria-hidden className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-fill text-ink-2 sm:flex">
                    <Icon className="size-[18px]" strokeWidth={1.75} />
                  </span>
                  <Link href={`/bookings/${b.id}`} className="group min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink group-hover:underline group-hover:underline-offset-4">
                      {b.guest.name} <span className="font-normal text-ink-2">{verb}</span>
                    </span>
                    <span className="block truncate text-small text-ink-2">
                      {unitName(b.unit)}, {guestsWord(b.guest.pax)}, {CHANNELS[b.channel].name}, {moneyShort(b).toLowerCase()}
                    </span>
                  </Link>
                  {!done && m.kind === "out" && (
                    <Button size="sm" variant="secondary" onClick={() => checkOut(b.id)}>
                      Check out
                    </Button>
                  )}
                  {!done && m.kind === "in" && (
                    <Button size="sm" variant="secondary" onClick={() => checkIn(b.id)}>
                      Check in
                    </Button>
                  )}
                  {done && <span className="text-small text-ink-3">Done</span>}
                </div>
              );
            })}
          </List>
        )}
        <Link
          href="/caretaker"
          className="flex items-center gap-3 border-t border-line px-4 py-3 text-small text-ink-2 transition-colors first:rounded-t-[15px] last:rounded-b-[15px] hover:bg-fill"
        >
          <Avatar name={CARETAKER} size="sm" />
          <span className="min-w-0 flex-1">
            {CARETAKER} read the Hindi briefing at 8 AM and replied <span lang="hi" className="text-ink">“जी ठीक है”</span>.
          </span>
          <span className="shrink-0 font-medium text-accent">Caretaker view</span>
        </Link>
      </Surface>
    </section>
  );
}

/* ---------- this month ---------- */

function MonthSection() {
  const bookings = useStore((s) => s.bookings);
  const n = monthNumbers(bookings);
  return (
    <section aria-labelledby="month-h">
      <SectionHeader id="month-h" title={`${fmtMonth(TODAY.slice(0, 7)).split(" ")[0]} so far`} action={<SectionLink href="/more/reports">Reports</SectionLink>} />
      <Surface className="grid grid-cols-2 gap-x-5 gap-y-6 p-5">
        <Stat label="Booked" value={inr(n.value)} context={`${n.count} stays starting this month`} />
        <Stat
          label="Occupancy"
          value={`${n.occupancy}%`}
          context={`${n.soldNights} of ${n.capacity} nights`}
          meter={{ value: n.soldNights, max: n.capacity, label: "Nights sold this month" }}
        />
        <Stat label="Fakes caught" value={n.caught} context={`${inr(n.freed)} of nights freed`} />
        <Stat label="To collect" value={inr(n.collect)} context="At the property, rest of the month" />
      </Surface>
    </section>
  );
}

/* ---------- platforms ---------- */

function PlatformsSection() {
  const bookings = useStore((s) => s.bookings);
  const waiting = bookings.filter((b) => b.channel === "mmt" && needsAction(b)).length;
  return (
    <section aria-labelledby="plat-h">
      <SectionHeader id="plat-h" title="Platforms" action={<SectionLink href="/more/platforms">Manage</SectionLink>} />
      <Surface>
        <List>
          {CHANNEL_CONFIG.filter((c) => c.id !== "direct").map((c) => {
            const warn = c.id === "mmt" && waiting > 0;
            return (
              <Link key={c.id} href="/more/platforms" className="flex items-center gap-3 px-4 py-3 transition-colors first:rounded-t-[15px] last:rounded-b-[15px] hover:bg-fill">
                <span
                  aria-hidden
                  className={cn("size-2 shrink-0 rounded-full", warn ? "border-[1.5px] border-dashed border-alert" : "bg-ink/70")}
                />
                <span className="flex-1 truncate text-body font-medium text-ink">{CHANNELS[c.id].name}</span>
                <span className={cn("tabular text-small", warn ? "text-alert-ink" : "text-ink-2")}>
                  {warn ? `${waiting} waiting for the guest` : `Synced ${c.last}`}
                </span>
              </Link>
            );
          })}
        </List>
        <p className="flex items-start gap-2 border-t border-line px-4 py-3 text-caption text-ink-2">
          <ArrowLeftRight aria-hidden className="mt-px size-3.5 shrink-0" />
          A booking on any platform closes the same nights on the other three within minutes.
        </p>
      </Surface>
    </section>
  );
}

/* ---------- what goes out next ---------- */

function OutgoingSection() {
  const bookings = useStore((s) => s.bookings);
  const next = scheduledSends(bookings).slice(0, 3);
  return (
    <section aria-labelledby="out-h">
      <SectionHeader id="out-h" title="Going out next on WhatsApp" action={<SectionLink href="/messages?view=scheduled">All</SectionLink>} />
      <Surface>
        <List>
          {next.map((s, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-3" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <p className="text-small text-ink">{s.what}</p>
                <p className="mt-0.5 text-caption text-ink-2">
                  {s.booking ? s.booking.guest.name : CARETAKER}, {relDay(s.ts).toLowerCase()} at {fmtTime(s.ts)}
                </p>
              </div>
            </div>
          ))}
        </List>
      </Surface>
    </section>
  );
}
