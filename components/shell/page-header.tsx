"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Large title with an optional kicker line, description and actions.
 * On phones a compact bar stays at the top and shows the title once the large one scrolls away.
 * `actions` render in the compact bar on phones and beside the title on laptops.
 */
export function PageHeader({
  kicker,
  title,
  description,
  actions,
  mobileActions,
  back,
  className,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Replaces `actions` in the phone bar when they need to be smaller */
  mobileActions?: ReactNode;
  back?: { href: string; label: string };
  className?: string;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCompact(!e.isIntersecting), { rootMargin: "-52px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div
        className={cn(
          "pt-safe sticky top-0 z-30 border-b bg-paper/90 backdrop-blur-md transition-[border-color] duration-200 lg:hidden",
          compact ? "border-line" : "border-transparent",
        )}
      >
        <div className="relative flex h-[52px] items-center gap-1 px-2">
          {back ? (
            <Link
              href={back.href}
              className="relative z-10 -ml-0.5 inline-flex h-10 min-w-0 items-center gap-0.5 rounded-md pr-2 pl-1 text-body text-accent hover:bg-fill"
            >
              <ChevronLeft aria-hidden className="size-5 shrink-0" strokeWidth={2} />
              <span className={cn("truncate transition-opacity duration-200", compact && "max-xs:sr-only")}>{back.label}</span>
            </Link>
          ) : (
            <span className="w-2" />
          )}
          <span
            aria-hidden={!compact}
            className={cn(
              "pointer-events-none absolute inset-x-24 truncate text-center text-body font-medium text-ink transition-[opacity,transform] duration-200",
              compact ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
            )}
          >
            {title}
          </span>
          <div className="relative z-10 ml-auto flex items-center gap-1">{mobileActions ?? actions}</div>
        </div>
      </div>

      <header className={cn("px-4 pt-1 pb-6 lg:px-10 lg:pt-10 lg:pb-8", className)}>
        {back && (
          <Link
            href={back.href}
            className="mb-4 hidden items-center gap-1 rounded-sm text-small text-ink-2 transition-colors hover:text-ink lg:inline-flex"
          >
            <ChevronLeft aria-hidden className="size-4" />
            {back.label}
          </Link>
        )}
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            {kicker && <p className="mb-1 text-small text-ink-2">{kicker}</p>}
            <h1 className="text-[1.5rem] leading-[1.875rem] font-medium tracking-[-0.022em] text-ink lg:text-display">{title}</h1>
            {description && <div className="mt-2 max-w-2xl text-body text-ink-2">{description}</div>}
          </div>
          {actions && <div className="hidden shrink-0 items-center gap-2 lg:flex">{actions}</div>}
        </div>
        <div ref={sentinel} aria-hidden className="h-px" />
      </header>
    </>
  );
}

/** Page body: gutters and max width. */
export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-4 lg:px-10", className)}>{children}</div>;
}
