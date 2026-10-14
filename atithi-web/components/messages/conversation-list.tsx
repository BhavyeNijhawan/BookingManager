"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import type { Booking, Thread } from "@/lib/types";
import { Avatar } from "@/components/ui/bits";
import { EmptyState, List, Surface } from "@/components/ui/surface";
import { byNewest, contextOf, isHindi, lastMsg, listStamp, previewOf } from "./model";

/**
 * Every WhatsApp conversation, newest first. `pane` is the laptop column (inset rows,
 * the open conversation highlighted), `page` the phone screen (rows in a surface).
 * The pathname comes in as a prop so the Suspense fallback never reads the URL.
 */
export function ConversationList({ variant, pathname }: { variant: "pane" | "page"; pathname?: string | null }) {
  const threads = useStore((s) => s.threads);
  const bookings = useStore((s) => s.bookings);
  const sorted = [...threads].sort(byNewest);
  const pane = variant === "pane";

  if (!sorted.length) return <EmptyState icon={<MessageCircle aria-hidden />} title="No conversations yet" />;

  const rows = sorted.map((t) => (
    <ConversationRow
      key={t.id}
      thread={t}
      booking={t.bookingId ? bookings.find((b) => b.id === t.bookingId) : undefined}
      selected={pane && pathname === `/messages/${t.id}`}
      pane={pane}
    />
  ));

  return pane ? (
    <nav aria-label="Conversations" className="flex flex-col gap-0.5 px-2">
      {rows}
    </nav>
  ) : (
    <Surface>
      <List>{rows}</List>
    </Surface>
  );
}

function ConversationRow({ thread: t, booking, selected, pane }: { thread: Thread; booking?: Booking; selected: boolean; pane: boolean }) {
  const last = lastMsg(t);
  const unread = t.unread > 0;
  const preview = previewOf(last);
  return (
    <Link
      href={`/messages/${t.id}`}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "group flex min-w-0 items-center gap-3 transition-[background-color] duration-150",
        pane ? "rounded-lg px-3 py-3" : "px-4 py-3.5 first:rounded-t-[15px] last:rounded-b-[15px]",
        selected ? "bg-fill-2" : "hover:bg-fill",
      )}
    >
      <Avatar name={t.who} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate font-medium text-ink">{t.who}</span>
          {last && (
            <span className={cn("tabular shrink-0 text-caption", unread ? "font-medium text-ink" : "text-ink-2")}>
              {listStamp(last.ts)}
            </span>
          )}
        </span>
        <span className="mt-0.5 flex items-center gap-3">
          <span lang={last && isHindi(last.text) ? "hi" : undefined} className={cn("min-w-0 flex-1 truncate text-small", unread ? "text-ink" : "text-ink-2")}>
            {preview}
          </span>
          {unread && (
            <span className="size-2 shrink-0 rounded-full bg-ink">
              <span className="sr-only">, unread</span>
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-caption text-ink-2">{contextOf(t, booking)}</span>
      </span>
    </Link>
  );
}
