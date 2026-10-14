"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Switch } from "@/components/ui/bits";

/** A quiet 36px rounded square that holds a settings icon. */
export function IconTile({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-md bg-fill text-ink-2 [&_svg]:size-[18px] [&_svg]:stroke-[1.75]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * A settings row with a switch on the right. The whole row is a label, so a tap on the text
 * toggles the switch too. The switch's accessible name is the title.
 */
export function SwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  /** Extra content under the description (a caution line) */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-4 px-4 py-3.5", className)}>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-small text-ink-2">{description}</span>}
        {children}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} label={title} className="mt-0.5" />
    </label>
  );
}

/** A small explanatory paragraph with an optional leading icon, used under groups. */
export function Note({ icon, children, className }: { icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 px-1 text-small text-ink-2 [&_svg]:mt-[3px] [&_svg]:size-3.5 [&_svg]:shrink-0", className)}>
      {icon}
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/** A small dot that shows a platform or service is working (ink) or waiting on a guest (dashed alert). */
export function HealthDot({ tone = "ok", className }: { tone?: "ok" | "warn"; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("size-2 shrink-0 rounded-full", tone === "warn" ? "border-[1.5px] border-dashed border-alert" : "bg-ink/70", className)}
    />
  );
}
