import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none " +
  "transition-[background-color,border-color,color,transform,opacity] duration-150 ease-out " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-[color-mix(in_srgb,var(--accent)_86%,black)]",
  secondary: "border border-line-2 bg-surface text-ink hover:border-ink/25 hover:bg-[color-mix(in_srgb,var(--surface)_94%,var(--ink))]",
  ghost: "text-ink hover:bg-fill",
  danger: "bg-alert-ink text-white hover:bg-[color-mix(in_srgb,var(--alert-ink)_86%,black)]",
  link: "h-auto px-0 text-accent underline-offset-4 decoration-1 hover:underline active:scale-100",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 rounded-md px-3 text-small [&_svg]:size-4",
  md: "h-10 rounded-md px-4 text-body [&_svg]:size-[18px]",
  lg: "h-12 rounded-lg px-5 text-[0.9375rem] [&_svg]:size-5",
};

export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md", className?: string) {
  return cn(base, sizes[size], variants[variant], variant === "link" && "h-auto px-0", className);
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode; className?: string; children?: ReactNode };

export function Button({ variant, size, icon, className, children, type = "button", ...rest }: Common & ComponentProps<"button">) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, icon, className, children, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}

/** Square icon-only button. Always pass a `label`; it becomes the aria-label and the tooltip text. */
export function IconButton({
  label,
  children,
  className,
  size = "md",
  ...rest
}: { label: string; size?: "sm" | "md" } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md text-ink-2 transition-[background-color,color] duration-150 hover:bg-fill hover:text-ink",
        size === "sm" ? "size-8 [&_svg]:size-4" : "size-10 [&_svg]:size-5",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
