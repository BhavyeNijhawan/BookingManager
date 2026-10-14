import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Grouped content: surface fill, hairline border, 16px radius, no shadow. */
export function Surface({
  tone = "default",
  className,
  ...rest
}: { tone?: "default" | "alert" | "quiet" } & ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-surface",
        tone === "alert" ? "border-alert-line" : "border-line",
        tone === "quiet" && "bg-transparent",
        className,
      )}
      {...rest}
    />
  );
}

/** A section title that sits above a group. 13px, medium, sentence case. */
export function SectionHeader({
  title,
  count,
  action,
  tone = "default",
  id,
  className,
}: {
  title: ReactNode;
  count?: number | string;
  action?: ReactNode;
  tone?: "default" | "alert";
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex min-h-6 items-center justify-between gap-4 px-1", className)}>
      <h2
        id={id}
        className={cn("flex items-center gap-2 text-small font-medium", tone === "alert" ? "text-alert-ink" : "text-ink")}
      >
        {tone === "alert" && <span aria-hidden className="size-1.5 rounded-full bg-alert" />}
        {title}
        {count !== undefined && <span className="tabular font-normal text-ink-3">{count}</span>}
      </h2>
      {action}
    </div>
  );
}

/** A small accent text link used in section headers ("Full calendar") */
export function SectionLink({ className, children, ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "-my-1 inline-flex items-center gap-0.5 rounded-sm py-1 text-small font-medium text-accent underline-offset-4 hover:underline",
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}

/** A vertical list inside a Surface with hairline dividers. */
export function List({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cn("divide-y divide-line", className)} {...rest} />;
}

type RowContent = {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  className?: string;
};

const rowClass =
  "group flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left transition-[background-color] duration-150 first:rounded-t-[15px] last:rounded-b-[15px]";

function RowInner({ leading, title, subtitle, meta, trailing, chevron }: RowContent) {
  return (
    <>
      {leading}
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="min-w-0 truncate font-medium text-ink">{title}</span>
          {meta && <span className="tabular shrink-0 text-small text-ink-2">{meta}</span>}
        </span>
        {subtitle && <span className="mt-0.5 block text-small text-ink-2">{subtitle}</span>}
      </span>
      {trailing}
      {chevron && <ChevronRight aria-hidden className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />}
    </>
  );
}

/** One row. Pass `href` for navigation, `onClick` for an action, or neither for static content. */
export function ListRow(props: RowContent & { href?: string; onClick?: () => void; "aria-label"?: string }) {
  const { href, onClick, className } = props;
  if (href)
    return (
      <Link href={href} aria-label={props["aria-label"]} className={cn(rowClass, "hover:bg-fill", className)}>
        <RowInner {...props} />
      </Link>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} aria-label={props["aria-label"]} className={cn(rowClass, "hover:bg-fill", className)}>
        <RowInner {...props} />
      </button>
    );
  return (
    <div className={cn(rowClass, className)}>
      <RowInner {...props} />
    </div>
  );
}

/** Label / value pairs (booking details, settings). */
export function KeyValues({ rows, className }: { rows: { k: ReactNode; v: ReactNode; tone?: "alert" }[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-line px-4", className)}>
      {rows.map((r, i) => (
        <div key={i} className="flex items-start justify-between gap-6 py-3 text-small">
          <dt className="shrink-0 text-ink-2">{r.k}</dt>
          <dd className={cn("tabular min-w-0 text-right break-words", r.tone === "alert" ? "text-alert-ink" : "text-ink")}>{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-6 py-10 text-center", className)}>
      {icon && <span className="mb-1 flex size-10 items-center justify-center rounded-full bg-fill text-ink-2 [&_svg]:size-5">{icon}</span>}
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="max-w-sm text-small text-ink-2">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
