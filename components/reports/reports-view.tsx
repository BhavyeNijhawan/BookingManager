"use client";

import { toast } from "sonner";
import { Download, ShieldCheck } from "lucide-react";
import { CHANNELS, TODAY, UNITS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { addDays, firstName, fmtMonth, inr, nightsBetween, plural } from "@/lib/format";
import { isLive, isPayAtProperty, monthNumbers, needsAction } from "@/lib/selectors";
import type { Block, Booking, ChannelId } from "@/lib/types";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Button, IconButton } from "@/components/ui/button";
import { Stat } from "@/components/ui/bits";
import { SectionHeader, Surface } from "@/components/ui/surface";
import { BarList, type BarDatum } from "./bar-list";

const YM = TODAY.slice(0, 7);
const MONTH_START = `${YM}-01`;
const [Y, M] = YM.split("-").map(Number);
const DAYS = new Date(Date.UTC(Y, M, 0)).getUTCDate();
const MONTH_END = addDays(MONTH_START, DAYS);
const MONTH_NAME = fmtMonth(YM).split(" ")[0];

/** Nights of a stay or block that fall inside the month */
const nightsInMonth = (x: { ci: string; co: string }) =>
  Math.max(0, nightsBetween(x.ci < MONTH_START ? MONTH_START : x.ci, x.co > MONTH_END ? MONTH_END : x.co));

const names = (list: Booking[]) => list.map((b) => b.guest.name).join(", ");
const firstNames = (list: Booking[]) => list.map((b) => firstName(b.guest.name)).join(", ");

function exportCsv() {
  toast(`${MONTH_NAME} report`, { description: "The real app downloads this as a CSV for your accountant." });
}

export function ReportsView() {
  const bookings = useStore((s) => s.bookings);
  const blocks = useStore((s) => s.blocks);
  const n = monthNumbers(bookings);

  return (
    <>
      <PageHeader
        back={{ href: "/more", label: "More" }}
        kicker={fmtMonth(YM)}
        title="Reports"
        description="Stays starting this month, as of Sunday 11 October at 12:40 PM."
        actions={
          <Button variant="secondary" icon={<Download aria-hidden />} onClick={exportCsv}>
            Download CSV
          </Button>
        }
        mobileActions={
          <IconButton label="Download the report as CSV" onClick={exportCsv} className="text-accent">
            <Download aria-hidden strokeWidth={1.75} />
          </IconButton>
        }
      />
      <PageBody>
        <section aria-label={`${MONTH_NAME} at a glance`}>
          <Surface className="grid grid-cols-2 gap-x-5 gap-y-6 p-5 lg:grid-cols-4 lg:gap-x-8 lg:px-6">
            <Stat label="Booked" value={inr(n.value)} context={`${plural(n.count, "stay")} starting in ${MONTH_NAME}`} />
            <Stat
              label="Occupancy"
              value={`${n.occupancy}%`}
              context={`${n.soldNights} of ${n.capacity} nights, both units`}
              meter={{ value: n.soldNights, max: n.capacity, label: "Nights sold this month" }}
            />
            <Stat label="Fakes caught" value={n.caught} context={`${inr(n.freed)} of nights freed`} />
            <Stat label="To collect" value={inr(n.collect)} context="At the property, rest of the month" />
          </Surface>
        </section>

        <div className="mt-9 grid gap-x-10 gap-y-9 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-9">
            <PlatformChart bookings={bookings} total={n.value} />
            <UnitOccupancy bookings={bookings} blocks={blocks} />
          </div>
          <div className="flex min-w-0 flex-col gap-9">
            <PayAtProperty bookings={bookings} />
            <Surface tone="quiet" className="flex items-start gap-3 p-4">
              <ShieldCheck aria-hidden className="mt-0.5 size-[18px] shrink-0 text-ink-2" strokeWidth={1.75} />
              <div className="min-w-0 text-small text-ink-2">
                <p className="font-medium text-ink">Fake bookings no longer hold your weekends</p>
                <p className="mt-1">
                  Before, a pay-at-property guest who never meant to come kept the nights closed on every platform. Now the nights are
                  released within 24 hours if the guest never confirms.
                  {n.freed > 0 && ` This month that freed ${inr(n.freed)} of nights.`}
                </p>
              </div>
            </Surface>
          </div>
        </div>
      </PageBody>
    </>
  );
}

/* ---------- bookings by platform ---------- */

function PlatformChart({ bookings, total }: { bookings: Booking[]; total: number }) {
  const starting = bookings.filter((b) => isLive(b) && b.ci.startsWith(YM));
  const ids = Object.keys(CHANNELS) as ChannelId[];
  const rows = ids
    .map((id) => {
      const list = starting.filter((b) => b.channel === id);
      const value = list.reduce((a, b) => a + b.amount, 0);
      const pending = list.filter(needsAction).length;
      return { id, list, value, pending };
    })
    .sort((a, b) => b.value - a.value);

  const data: BarDatum[] = rows.map(({ id, list, value, pending }) => {
    const share = total ? Math.round((value / total) * 100) : 0;
    const name = CHANNELS[id].name;
    return {
      key: id,
      label: name,
      sub: plural(list.length, "stay"),
      value,
      display: inr(value),
      extra: `${share}%`,
      tip: (
        <span className="block">
          <span className="tabular block text-small font-medium text-ink">{inr(value)}</span>
          <span className="block text-ink-2">
            {name}, {plural(list.length, "stay")}, {share}% of {MONTH_NAME}
          </span>
          {pending > 0 && (
            <span className="mt-1 block text-alert-ink">
              Includes {plural(pending, "booking")} still being verified
            </span>
          )}
        </span>
      ),
    };
  });

  return (
    <section aria-labelledby="by-plat-h">
      <SectionHeader
        id="by-plat-h"
        title="Bookings by platform"
        action={<span className="tabular text-small text-ink-2">{inr(total)} in all</span>}
      />
      <Surface className="px-4 pt-3 pb-4 sm:px-5">
        <div aria-hidden className="mb-1 hidden items-center gap-3 text-caption text-ink-3 sm:flex">
          <span className="w-32 shrink-0">Platform</span>
          <span className="flex-1">Booked value</span>
          <span className="w-12 shrink-0 text-right">Share</span>
        </div>
        <BarList data={data} label={`Booked value by platform, ${MONTH_NAME}`} />
        <p className="mt-3 border-t border-line pt-3 text-caption text-ink-2">
          Gross value of stays starting in {MONTH_NAME}, including bookings still being verified. Platform commission comes off in the
          payout.
        </p>
      </Surface>
    </section>
  );
}

/* ---------- occupancy by unit ---------- */

function UnitOccupancy({ bookings, blocks }: { bookings: Booking[]; blocks: Block[] }) {
  return (
    <section aria-labelledby="occ-h">
      <SectionHeader id="occ-h" title="Occupancy by unit" />
      <Surface className="grid grid-cols-2 gap-x-5 gap-y-6 p-5 lg:gap-x-8">
        {UNITS.map((u) => {
          const sold = bookings.filter((b) => b.unit === u.id && isLive(b)).reduce((a, b) => a + nightsInMonth(b), 0);
          const blocked = blocks.filter((b) => b.unit === u.id).reduce((a, b) => a + nightsInMonth(b), 0);
          const pct = Math.round((sold / DAYS) * 100);
          return (
            <Stat
              key={u.id}
              label={u.name}
              value={`${pct}%`}
              meter={{ value: sold, max: DAYS, label: `${u.name}, nights sold in ${MONTH_NAME}` }}
              context={`${sold} of ${DAYS} nights sold${blocked ? `, ${blocked} blocked` : ""}`}
            />
          );
        })}
      </Surface>
    </section>
  );
}

/* ---------- pay-at-property funnel ---------- */

function PayAtProperty({ bookings }: { bookings: Booking[] }) {
  const pah = bookings.filter((b) => isPayAtProperty(b) && b.ci.startsWith(YM));
  const paid = pah.filter((b) => b.status === "confirmed" || b.status === "in_house" || b.status === "checked_out");
  const pending = pah.filter(needsAction);
  const fake = pah.filter((b) => b.status === "cancelled");
  const mmt = pah.filter((b) => b.channel === "mmt").length;
  const direct = pah.length - mmt;
  const freed = fake.reduce((a, b) => a + b.amount, 0);

  const row = (key: string, label: string, list: Booking[], sub: string, tip: string, subTone?: "alert"): BarDatum => ({
    key,
    label,
    sub,
    subTone,
    value: list.length,
    display: String(list.length),
    tip,
  });

  const data: BarDatum[] = [
    row(
      "received",
      "Received",
      pah,
      [mmt && `MakeMyTrip ${mmt}`, direct && `direct ${direct}`].filter(Boolean).join(", ") || "None yet",
      `${plural(pah.length, "pay-at-property booking")} for stays starting in ${MONTH_NAME}`,
    ),
    row("paid", "Verified and paid", paid, firstNames(paid) || "None yet", paid.length ? `${names(paid)}: the guest said yes and the advance arrived` : "None yet"),
    row(
      "pending",
      "Still being verified",
      pending,
      firstNames(pending) || "None",
      pending.length ? `${names(pending)}: waiting for the guest to reply or pay. The nights stay held meanwhile.` : "Nothing waiting",
      pending.length ? "alert" : undefined,
    ),
    row(
      "fake",
      "Cancelled as fake",
      fake,
      fake.length ? `${inr(freed)} of nights freed` : "None",
      fake.length ? `${names(fake)}: no reply in 24 hours, nights released everywhere` : "No fake bookings this month",
    ),
  ];

  return (
    <section aria-labelledby="pah-h">
      <SectionHeader id="pah-h" title="Pay-at-property bookings" />
      <Surface className="px-4 pt-3 pb-4 sm:px-5">
        <BarList data={data} label={`Pay-at-property bookings in ${MONTH_NAME}`} max={Math.max(1, pah.length)} size="sm" labelWidth="w-36 sm:w-40" />
        <p className="mt-3 border-t border-line pt-3 text-caption text-ink-2">
          Bookings where the guest pays at check-in. Each one is checked on WhatsApp before it can hold your nights.
        </p>
      </Surface>
    </section>
  );
}
