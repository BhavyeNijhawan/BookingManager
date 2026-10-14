"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/ui/bits";

export interface BarDatum {
  key: string;
  label: ReactNode;
  /** One short line under the label */
  sub?: ReactNode;
  subTone?: "alert";
  value: number;
  /** The value as written at the bar tip */
  display: string;
  /** Extra column shown from the small breakpoint up (share, counts) */
  extra?: ReactNode;
  tip: ReactNode;
}

/**
 * Horizontal bars in one ink hue, growing from a single baseline, with the value written at the tip.
 * Bars are at most 20px thick with a 4px rounded data end and a square base. Each row carries a
 * tooltip on hover and keyboard focus; the tooltip only adds detail, every value is printed.
 */
export function BarList({
  data,
  label,
  max,
  size = "md",
  labelWidth = "w-24 sm:w-32",
  className,
}: {
  data: BarDatum[];
  /** Accessible name of the list */
  label: string;
  /** Scale maximum. Defaults to the largest value. */
  max?: number;
  size?: "md" | "sm";
  labelWidth?: string;
  className?: string;
}) {
  const top = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <ul aria-label={label} className={cn("flex flex-col", size === "md" ? "gap-1" : "gap-0.5", className)}>
      {data.map((d) => {
        const ratio = Math.max(0, Math.min(1, d.value / top));
        return (
          <Tip key={d.key} content={d.tip} side="top">
            <li
              tabIndex={0}
              className="group -mx-2 flex items-center gap-3 rounded-md px-2 py-1.5 transition-[background-color] duration-150 hover:bg-fill focus-visible:bg-fill"
            >
              <span className={cn("min-w-0 shrink-0", labelWidth)}>
                <span className="block truncate text-small text-ink">{d.label}</span>
                {d.sub && (
                  <span className={cn("block truncate text-caption", d.subTone === "alert" ? "text-alert-ink" : "text-ink-3")}>{d.sub}</span>
                )}
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-2 self-stretch border-l border-line-2">
                <span
                  aria-hidden
                  className={cn(
                    "block shrink-0 rounded-r-[4px] bg-ink/80 transition-opacity duration-150 group-hover:opacity-75",
                    size === "md" ? "h-4" : "h-2.5",
                    ratio === 0 && "w-0",
                  )}
                  style={ratio > 0 ? { width: `max(2px, calc((100% - 5.5rem) * ${ratio.toFixed(4)}))` } : undefined}
                />
                <span className="tabular shrink-0 text-small font-medium text-ink">{d.display}</span>
              </span>
              {d.extra && <span className="tabular hidden w-12 shrink-0 text-right text-small text-ink-2 sm:block">{d.extra}</span>}
            </li>
          </Tip>
        );
      })}
    </ul>
  );
}
