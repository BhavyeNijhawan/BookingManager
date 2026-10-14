"use client";

import { useStore } from "@/lib/store";
import { needsAction, unreadCount } from "@/lib/selectors";
import type { BadgeKind } from "./nav";

/** Live counts for the nav: bookings needing action and unread WhatsApp threads */
export function useBadges() {
  const action = useStore((s) => s.bookings.filter(needsAction).length);
  const unread = useStore((s) => unreadCount(s.threads));
  return (kind?: BadgeKind) => {
    if (kind === "attention") return action > 0 ? ({ type: "dot", value: action } as const) : null;
    if (kind === "action-count") return action > 0 ? ({ type: "count", value: action, tone: "alert" } as const) : null;
    if (kind === "unread") return unread > 0 ? ({ type: "count", value: unread, tone: "ink" } as const) : null;
    return null;
  };
}
