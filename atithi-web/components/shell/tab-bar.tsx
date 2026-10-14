"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { TAB_NAV, isActive } from "./nav";
import { useBadges } from "./use-badges";

export function TabBar() {
  const pathname = usePathname();
  const badgeFor = useBadges();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/92 pb-safe backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid h-[60px] max-w-xl grid-cols-5">
        {TAB_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const badge = badgeFor(item.badge);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 text-micro transition-colors",
                  active ? "font-medium text-ink" : "text-ink-3 hover:text-ink-2",
                )}
              >
                <span
                  className={cn(
                    "relative flex h-7 w-14 items-center justify-center rounded-full transition-[background-color] duration-200",
                    active && "bg-fill-2",
                  )}
                >
                  <Icon aria-hidden strokeWidth={active ? 2 : 1.75} className="size-[21px]" />
                  {badge?.type === "dot" && (
                    <span className="absolute top-0.5 right-3.5 size-2 rounded-full bg-alert ring-2 ring-surface">
                      <span className="sr-only">{badge.value} need attention</span>
                    </span>
                  )}
                  {badge?.type === "count" && (
                    <span
                      className={cn(
                        "tabular absolute -top-1 right-1.5 min-w-[18px] rounded-full px-1 text-center text-[10px] leading-[16px] font-medium ring-2 ring-surface",
                        badge.tone === "alert" ? "bg-alert-ink text-white" : "bg-ink text-paper",
                      )}
                    >
                      {badge.value}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
