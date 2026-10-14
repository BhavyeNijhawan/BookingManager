"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Play, Smartphone } from "lucide-react";
import { cn } from "@/lib/cn";
import { CITY, OWNER, PROPERTY, UNITS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/ui/bits";
import { Wordmark } from "./brand";
import { MANAGE_NAV, PRIMARY_NAV, SETTINGS_NAV, isActive, type NavItem } from "./nav";
import { useBadges } from "./use-badges";

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const badge = useBadges()(item.badge);
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex h-9 items-center gap-3 rounded-md px-2.5 text-body transition-[background-color,color] duration-150",
        active ? "bg-fill-2 font-medium text-ink" : "text-ink-2 hover:bg-fill hover:text-ink",
      )}
    >
      <Icon aria-hidden strokeWidth={1.75} className={cn("size-[18px]", active ? "text-ink" : "text-ink-3 group-hover:text-ink-2")} />
      <span className="flex-1 truncate">{item.label}</span>
      {badge?.type === "dot" && (
        <span className="size-2 rounded-full bg-alert">
          <span className="sr-only">{badge.value} need attention</span>
        </span>
      )}
      {badge?.type === "count" && (
        <span
          className={cn(
            "tabular min-w-5 rounded-full px-1.5 text-center text-caption leading-5 font-medium",
            badge.tone === "alert" ? "bg-alert-soft text-alert-ink" : "bg-ink text-paper",
          )}
        >
          {badge.value}
        </span>
      )}
    </Link>
  );
}

function Group({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) {
  return (
    <div className="mt-6">
      <p className="mb-1.5 px-2.5 text-caption text-ink-3">{label}</p>
      <nav aria-label={label} className="flex flex-col gap-0.5">
        {items.map((it) => (
          <NavLink key={it.href} item={it} pathname={pathname} />
        ))}
      </nav>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const openSheet = useStore((s) => s.openSheet);
  return (
    <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col border-r border-line bg-paper px-4 pt-6 pb-4 lg:flex">
      <Link href="/" className="rounded-md px-1.5 py-1" aria-label="Atithi, go to Today">
        <Wordmark />
      </Link>

      <div className="mt-6 rounded-lg border border-line bg-surface px-3 py-2.5">
        <p className="truncate text-small font-medium text-ink">{PROPERTY}</p>
        <p className="truncate text-caption text-ink-2">
          {CITY}, {UNITS.length} units
        </p>
      </div>

      <div className="-mx-1 flex-1 overflow-y-auto px-1 pb-4">
        <nav aria-label="Main" className="mt-6 flex flex-col gap-0.5">
          {PRIMARY_NAV.map((it) => (
            <NavLink key={it.href} item={it} pathname={pathname} />
          ))}
        </nav>
        <Group label="Manage" items={MANAGE_NAV} pathname={pathname} />
        <Group label="Settings" items={SETTINGS_NAV} pathname={pathname} />
      </div>

      <div className="flex flex-col gap-1 border-t border-line pt-3">
        <button
          type="button"
          onClick={() => openSheet({ kind: "demo" })}
          className="flex h-9 items-center gap-3 rounded-md px-2.5 text-body text-accent transition-colors hover:bg-accent-soft"
        >
          <Play aria-hidden strokeWidth={1.75} className="size-[18px]" />
          Run the demo
        </button>
        <Link
          href="/caretaker"
          className="flex h-9 items-center gap-3 rounded-md px-2.5 text-body text-ink-2 transition-colors hover:bg-fill hover:text-ink"
        >
          <Smartphone aria-hidden strokeWidth={1.75} className="size-[18px] text-ink-3" />
          Caretaker view
        </Link>
        <div className="mt-2 flex items-center gap-3 px-1.5">
          <Avatar name={OWNER} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-small font-medium text-ink">{OWNER}</p>
            <p className="truncate text-caption text-ink-2">Owner</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
