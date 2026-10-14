"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Switch as SwitchPrimitive, Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

/* ---------- Avatar ---------- */

export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-fill-2 font-medium text-ink-2 select-none",
        size === "sm" && "size-8 text-caption",
        size === "md" && "size-10 text-small",
        size === "lg" && "size-12 text-body",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

/* ---------- Stat tile ---------- */

export function Stat({
  label,
  value,
  context,
  meter,
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  context?: ReactNode;
  meter?: { value: number; max: number; label: string };
  tone?: "alert";
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <span className="text-small text-ink-2">{label}</span>
      <span className={cn("mt-1 text-[1.625rem] leading-8 font-semibold tracking-[-0.02em]", tone === "alert" ? "text-alert-ink" : "text-ink")}>
        {value}
      </span>
      {meter && (
        <span
          role="meter"
          aria-label={meter.label}
          aria-valuenow={meter.value}
          aria-valuemin={0}
          aria-valuemax={meter.max}
          className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-fill-2"
        >
          <span className="block h-full rounded-full bg-ink" style={{ width: `${Math.min(100, (meter.value / meter.max) * 100)}%` }} />
        </span>
      )}
      {context && <span className="mt-1.5 text-caption text-ink-3">{context}</span>}
    </div>
  );
}

/* ---------- Segmented filter ---------- */

export interface SegmentItem {
  value: string;
  label: string;
  count?: number;
  href?: string;
  tone?: "alert";
}

export function Segmented({
  items,
  value,
  onChange,
  label,
  className,
}: {
  items: SegmentItem[];
  value: string;
  onChange?: (v: string) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("scrollbar-none -mx-4 flex overflow-x-auto px-4 lg:mx-0 lg:px-0", className)}
    >
      <div className="inline-flex shrink-0 gap-1 rounded-lg bg-fill p-1">
        {items.map((it) => {
          const selected = it.value === value;
          const cls = cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-small whitespace-nowrap transition-[background-color,color,box-shadow] duration-150",
            selected ? "bg-surface font-medium text-ink shadow-[0_0_0_1px_var(--color-line),0_1px_2px_var(--color-line)]" : "text-ink-2 hover:text-ink",
          );
          const inner = (
            <>
              {it.label}
              {it.count !== undefined && it.count > 0 && (
                <span className={cn("tabular text-caption", it.tone === "alert" ? "font-medium text-alert-ink" : "text-ink-3")}>{it.count}</span>
              )}
            </>
          );
          return it.href ? (
            <Link key={it.value} href={it.href} scroll={false} aria-current={selected ? "page" : undefined} className={cls}>
              {inner}
            </Link>
          ) : (
            <button key={it.value} type="button" aria-pressed={selected} onClick={() => onChange?.(it.value)} className={cls}>
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Switch ---------- */

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-transparent bg-line-2 transition-[background-color] duration-200 data-[state=checked]:bg-accent disabled:opacity-50",
        className,
      )}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-out data-[state=checked]:translate-x-[17px]" />
    </SwitchPrimitive.Root>
  );
}

/* ---------- Tooltip ---------- */

export function Tip({ content, children, side = "top" }: { content: ReactNode; children: ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          collisionPadding={12}
          className="anim-pop z-50 max-w-64 rounded-lg border border-line bg-surface px-3 py-2 text-caption text-ink shadow-float"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export const TipProvider = TooltipPrimitive.Provider;

/* ---------- Kbd-free inline meta list (no middle dots) ---------- */

/** Renders short facts with spacing instead of "A · B · C" chains. */
export function Facts({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <span className={cn("flex flex-wrap items-center gap-x-3 gap-y-0.5", className)}>
      {items.filter(Boolean).map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {it}
        </span>
      ))}
    </span>
  );
}
