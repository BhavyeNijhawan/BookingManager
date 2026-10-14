import type { ReactNode } from "react";
import { Check, CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

/** Two fields side by side, even on a 390px phone (the shared FieldRow stacks below 416px). */
export function Pair({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 lg:gap-4", className)}>{children}</div>;
}

/** Whole rupees or counts typed by hand: "12,000" and "₹ 12000" both read as 12000. */
export const toInt = (s: string) => {
  const clean = s.replace(/[^\d]/g, "");
  return clean ? Number(clean) : NaN;
};

/** A live line under the dates: free on every platform, or what is in the way. */
export function Availability({ clash, free }: { clash: string | null; free: string }) {
  return (
    <p role="status" className={cn("flex items-start gap-2 text-small", clash ? "text-alert-ink" : "text-ink-2")}>
      {clash ? (
        <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-alert" strokeWidth={2} />
      ) : (
        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-3" strokeWidth={2} />
      )}
      <span>{clash ?? free}</span>
    </p>
  );
}

/** The store's refusal, shown where the button is. */
export function FormError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-5 flex items-start gap-2 rounded-lg border border-alert-line bg-alert-soft px-3.5 py-3 text-small text-alert-ink">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-alert" strokeWidth={2} />
      <span>{children}</span>
    </p>
  );
}
