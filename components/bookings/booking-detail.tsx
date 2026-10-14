"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Phone, SearchX } from "lucide-react";
import { cn } from "@/lib/cn";
import { TODAY } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { callGuest } from "@/lib/contact";
import { channelName, moneyLine } from "@/lib/selectors";
import type { Booking } from "@/lib/types";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Button, ButtonLink, type ButtonVariant } from "@/components/ui/button";
import { StatusMark } from "@/components/ui/status";
import { EmptyState, Surface } from "@/components/ui/surface";
import {
  CaretakerSection,
  HistorySection,
  MoneySection,
  NotesSection,
  PlatformsSection,
  StayPass,
  VerificationSection,
} from "./booking-sections";

type Act = { label: string; variant: ButtonVariant; icon?: ReactNode; onClick: () => void; push?: boolean };

/** The actions for each status, as in docs/02-ux.md section 5.3 */
function useActions(b: Booking | undefined) {
  const router = useRouter();
  const remind = useStore((s) => s.remind);
  const remindPay = useStore((s) => s.remindPay);
  const markConfirmed = useStore((s) => s.markConfirmed);
  const checkIn = useStore((s) => s.checkIn);
  const checkOut = useStore((s) => s.checkOut);
  const openSheet = useStore((s) => s.openSheet);
  const ensureThread = useStore((s) => s.ensureThread);
  if (!b) return { primary: null, secondary: [] as Act[] };

  let primary: Act | null = null;
  const secondary: Act[] = [];
  const cancel = () => openSheet({ kind: "cancel", id: b.id });

  if (b.status === "unverified") {
    primary = { label: "Remind on WhatsApp", variant: "primary", onClick: () => remind(b.id) };
    secondary.push({ label: "Mark confirmed", variant: "secondary", onClick: () => markConfirmed(b.id) });
  } else if (b.status === "verified") {
    primary = { label: "Resend payment link", variant: "primary", onClick: () => remindPay(b.id) };
    secondary.push({ label: "Advance received", variant: "secondary", onClick: () => markConfirmed(b.id) });
  } else if (b.status === "flagged") {
    primary = { label: "Cancel and release dates", variant: "danger", onClick: cancel };
    secondary.push({ label: "Guest confirmed by phone", variant: "secondary", onClick: () => markConfirmed(b.id) });
  } else if (b.status === "confirmed" && b.ci === TODAY) {
    primary = { label: "Mark checked in", variant: "primary", onClick: () => checkIn(b.id) };
  } else if (b.status === "in_house") {
    primary = { label: "Mark checked out", variant: "primary", onClick: () => checkOut(b.id) };
  }

  secondary.push({ label: "Call", variant: "secondary", icon: <Phone aria-hidden />, onClick: () => callGuest(b) });
  secondary.push({
    label: "WhatsApp",
    variant: "secondary",
    icon: <MessageCircle aria-hidden />,
    onClick: () => router.push(`/messages/${ensureThread(b.id)}`),
  });
  if (b.status === "unverified" || b.status === "verified" || b.status === "confirmed") {
    secondary.push({ label: "Cancel booking", variant: "ghost", onClick: cancel, push: true });
  }
  return { primary, secondary };
}

export function BookingDetail({ id }: { id: string }) {
  const b = useStore((s) => s.bookings.find((x) => x.id === id));
  const { primary, secondary } = useActions(b);
  const primaryRef = useRef<HTMLDivElement>(null);

  if (!b) {
    return (
      <>
        <PageHeader back={{ href: "/bookings", label: "Bookings" }} title="Booking not found" />
        <PageBody>
          <Surface>
            <EmptyState
              icon={<SearchX aria-hidden />}
              title="This booking is not in the sample data"
              description="The demo booking and any booking you add live only until the page reloads."
              action={
                <ButtonLink href="/bookings" variant="secondary" size="sm">
                  All bookings
                </ButtonLink>
              }
            />
          </Surface>
        </PageBody>
      </>
    );
  }

  const kicker = (
    <span className="inline-flex flex-wrap gap-x-3">
      <span>{channelName(b)}</span>
      <span className="tabular text-ink-3">{b.ref}</span>
    </span>
  );
  const status = (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <StatusMark status={b.status} long className="text-body" />
      <span className="tabular text-body text-ink-2">{b.status === "cancelled" ? "Nights released on every platform" : moneyLine(b)}</span>
    </span>
  );

  return (
    <>
      <PageHeader back={{ href: "/bookings", label: "Bookings" }} kicker={kicker} title={b.guest.name} description={status} />
      <PageBody className={cn(primary && "pb-20 lg:pb-0")}>
        <div className="mb-9 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center" role="group" aria-label="Actions">
          {primary && (
            <div ref={primaryRef} className="w-full sm:w-auto">
              <Button variant={primary.variant} onClick={primary.onClick} className="w-full sm:w-auto">
                {primary.label}
              </Button>
            </div>
          )}
          {/* phones: an even two-column grid; from 640px the buttons join the row */}
          <div className="grid grid-cols-2 gap-2 sm:contents [&>*:last-child:nth-child(odd)]:col-span-2">
            {secondary.map((a) => (
              <Button
                key={a.label}
                variant={a.variant}
                icon={a.icon}
                onClick={a.onClick}
                className={cn(a.push && "sm:ml-auto", a.variant === "ghost" && "text-ink-2 hover:text-ink")}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Phones: one column in reading order. Laptops: main column and a 340px side column. */}
        <div className="flex flex-col gap-9 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-x-10">
          <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-9">
            <StayPass b={b} className="order-1" />
            <VerificationSection b={b} className="order-2" />
            <NotesSection b={b} className="order-5" />
            <HistorySection b={b} className="order-6" />
          </div>
          <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-9">
            <MoneySection b={b} className="order-3" />
            <PlatformsSection b={b} className="order-4" />
            <CaretakerSection b={b} className="order-7" />
          </div>
        </div>
      </PageBody>
      {primary && <StickyPrimary act={primary} watch={primaryRef} b={b} />}
    </>
  );
}

/** Phones: the main action stays reachable above the tab bar once its button scrolls away. */
function StickyPrimary({ act, watch, b }: { act: Act; watch: React.RefObject<HTMLDivElement | null>; b: Booking }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = watch.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 60), {
      rootMargin: "-52px 0px 0px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [watch]);

  return (
    <div
      inert={!show}
      className={cn(
        "fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom,0px))] z-20 border-t border-line bg-surface/92 backdrop-blur-md transition-[transform,opacity] duration-200 ease-out lg:hidden",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-2.5">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-small font-medium text-ink">{b.guest.name}</span>
          <StatusMark status={b.status} className="text-caption" />
        </span>
        <Button variant={act.variant} onClick={act.onClick} className="shrink-0">
          {act.label}
        </Button>
      </div>
    </div>
  );
}

/** Shown for a moment while the booking id is read from the URL */
export function BookingSkeleton() {
  const bar = "block rounded-md bg-fill";
  return (
    <>
      <PageHeader
        back={{ href: "/bookings", label: "Bookings" }}
        kicker={<span aria-hidden className={cn(bar, "h-4 w-40")} />}
        title={
          <>
            <span className="sr-only">Loading the booking…</span>
            <span aria-hidden className={cn(bar, "h-8 w-60")} />
          </>
        }
      />
      <PageBody>
        <div aria-hidden className="flex flex-col gap-9 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-10">
          <div className="flex flex-col gap-9">
            <span className={cn(bar, "h-10 w-72")} />
            <span className="block h-48 rounded-xl border border-line bg-surface" />
          </div>
          <span className="block h-56 rounded-xl border border-line bg-surface" />
        </div>
      </PageBody>
    </>
  );
}
