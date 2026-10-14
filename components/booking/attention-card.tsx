"use client";

import Link from "next/link";
import { ChevronRight, CircleAlert, MessageCircle, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { callGuest } from "@/lib/contact";
import { fmtRange, inr, nightsWord } from "@/lib/format";
import { attentionReason, channelName, nights, unitName } from "@/lib/selectors";
import type { Booking } from "@/lib/types";
import { Avatar } from "@/components/ui/bits";
import { Button, IconButton } from "@/components/ui/button";
import { StatusMark } from "@/components/ui/status";
import { Surface } from "@/components/ui/surface";
import { VerificationTrack } from "./verification-track";

/** One booking that needs the owner: who, where it is stuck, why, and the one action that fixes it. */
export function AttentionCard({ booking: b }: { booking: Booking }) {
  const router = useRouter();
  const remind = useStore((s) => s.remind);
  const remindPay = useStore((s) => s.remindPay);
  const openSheet = useStore((s) => s.openSheet);
  const ensureThread = useStore((s) => s.ensureThread);

  const primary =
    b.status === "unverified" ? (
      <Button variant="primary" onClick={() => remind(b.id)}>
        Remind on WhatsApp
      </Button>
    ) : b.status === "verified" ? (
      <Button variant="primary" onClick={() => remindPay(b.id)}>
        Resend payment link
      </Button>
    ) : (
      <Button variant="danger" onClick={() => openSheet({ kind: "cancel", id: b.id })}>
        Cancel and release dates
      </Button>
    );

  return (
    <Surface tone="alert" className="p-4 lg:p-5">
      <div className="flex items-start gap-3">
        <Avatar name={b.guest.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <Link
              href={`/bookings/${b.id}`}
              className="min-w-0 truncate text-[0.9375rem] font-medium text-ink underline-offset-4 hover:underline"
            >
              {b.guest.name}
            </Link>
            <span className="tabular shrink-0 text-small font-medium text-ink">{inr(b.amount)}</span>
          </div>
          <p className="mt-0.5 text-small text-ink-2">
            {unitName(b.unit)}, {fmtRange(b.ci, b.co)}, {nightsWord(nights(b))}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusMark status={b.status} />
            <span className="text-small text-ink-3">{channelName(b)}, pay at property</span>
          </div>
        </div>
      </div>

      <VerificationTrack booking={b} className="mt-5 rounded-lg bg-paper/70 px-3 pt-3 pb-2.5" />

      <p className="mt-4 flex gap-2 text-small text-ink">
        <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-alert" strokeWidth={2} />
        <span>{attentionReason(b)}</span>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {primary}
        <Button variant="secondary" icon={<Phone aria-hidden />} onClick={() => callGuest(b)} className="hidden sm:inline-flex">
          Call
        </Button>
        <IconButton
          label={`Call ${b.guest.name}`}
          className="border border-line-2 bg-surface text-ink hover:border-ink/25 sm:hidden"
          onClick={() => callGuest(b)}
        >
          <Phone aria-hidden strokeWidth={1.75} />
        </IconButton>
        <IconButton
          label={`Open WhatsApp chat with ${b.guest.name}`}
          className="border border-line-2 bg-surface text-ink hover:border-ink/25"
          onClick={() => router.push(`/messages/${ensureThread(b.id)}`)}
        >
          <MessageCircle aria-hidden strokeWidth={1.75} />
        </IconButton>
        <Link
          href={`/bookings/${b.id}`}
          className="ml-auto hidden h-10 items-center gap-0.5 rounded-md px-2 text-small font-medium text-accent hover:bg-accent-soft sm:inline-flex"
        >
          Details
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      </div>
    </Surface>
  );
}
