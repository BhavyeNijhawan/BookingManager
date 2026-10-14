"use client";

import { Segmented } from "@/components/ui/bits";
import type { InboxView } from "./model";
import { usePendingCount } from "./schedule-list";

/** Chats or "Going out next", kept in the URL as ?view= so it survives reloads and back. */
export function ViewSwitch({ view, base, className }: { view: InboxView; base: string; className?: string }) {
  const pending = usePendingCount();
  return (
    <Segmented
      label="Show"
      value={view}
      className={className}
      items={[
        { value: "chats", label: "Chats", href: base },
        { value: "scheduled", label: "Going out next", count: pending, href: `${base}?view=scheduled` },
      ]}
    />
  );
}
