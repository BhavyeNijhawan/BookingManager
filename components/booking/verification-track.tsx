import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { fmtDay, fmtTime } from "@/lib/format";
import { TODAY } from "@/lib/seed";
import { verificationTrack } from "@/lib/selectors";
import type { Booking } from "@/lib/types";

/**
 * The four steps a pay-at-property booking passes before it is safe:
 * Booked, Asked on WhatsApp, Guest said yes, Advance paid. Shows exactly where it is stuck.
 */
export function VerificationTrack({ booking, className }: { booking: Booking; className?: string }) {
  const steps = verificationTrack(booking);
  return (
    <ol aria-label="Verification progress" className={cn("grid grid-cols-4", className)}>
      {steps.map((s, i) => {
        const next = steps[i + 1];
        const connectorDone = s.state === "done" && next && (next.state === "done" || next.state === "current" || next.state === "failed");
        return (
          <li key={s.key} className="relative min-w-0 pr-2">
            <div className="flex items-center">
              <span
                className={cn(
                  "relative z-10 flex size-[18px] shrink-0 items-center justify-center rounded-full",
                  s.state === "done" && "bg-ink text-paper",
                  s.state === "current" && "border-[1.5px] border-dashed border-alert bg-surface",
                  s.state === "failed" && "bg-alert-ink text-white",
                  s.state === "todo" && "border-[1.5px] border-line-2 bg-surface",
                )}
              >
                {s.state === "done" && <Check aria-hidden strokeWidth={3} className="size-2.5" />}
                {s.state === "failed" && <X aria-hidden strokeWidth={3} className="size-2.5" />}
                {s.state === "current" && <span aria-hidden className="size-1.5 rounded-full bg-alert" />}
              </span>
              {next && (
                <span aria-hidden className="relative mx-1 h-[1.5px] flex-1 overflow-hidden rounded-full bg-line-2">
                  {connectorDone && (
                    <span className="track-fill absolute inset-0 bg-ink" style={{ animationDelay: `${i * 140}ms` }} />
                  )}
                </span>
              )}
            </div>
            <p
              className={cn(
                "mt-2 text-caption leading-[1.05rem] font-medium",
                s.state === "done" && "text-ink",
                (s.state === "current" || s.state === "failed") && "text-alert-ink",
                s.state === "todo" && "text-ink-3",
              )}
            >
              {s.label}
              <span className="sr-only">
                {s.state === "done" ? ", done" : s.state === "current" ? ", waiting" : s.state === "failed" ? ", failed" : ", not yet"}
              </span>
            </p>
            {(s.note || s.when) && (
              <p className={cn("mt-0.5 text-caption leading-4", s.state === "current" || s.state === "failed" ? "text-alert-ink" : "text-ink-3")}>
                {s.note ?? (s.when ? (s.when.startsWith(TODAY) ? fmtTime(s.when) : fmtDay(s.when)) : "")}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
