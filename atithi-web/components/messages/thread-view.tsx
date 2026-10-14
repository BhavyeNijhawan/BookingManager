"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ChevronLeft, MessageCircle, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { firstName, fmtTime, relDay } from "@/lib/format";
import { needsAction } from "@/lib/selectors";
import type { Booking, Thread } from "@/lib/types";
import { Avatar } from "@/components/ui/bits";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/surface";
import { StatusMark } from "@/components/ui/status";
import { Bubble } from "./bubble";
import { contextOf, minutesBetween } from "./model";

/** One WhatsApp conversation: header, messages with day separators, and the composer. */
export function ThreadView({ id }: { id: string }) {
  const thread = useStore((s) => s.threads.find((t) => t.id === id));
  const booking = useStore((s) => (thread?.bookingId ? s.bookings.find((b) => b.id === thread.bookingId) : undefined));
  const markRead = useStore((s) => s.markRead);
  const unread = thread?.unread ?? 0;

  useEffect(() => {
    if (unread) markRead(id);
  }, [id, unread, markRead]);

  if (!thread) {
    return (
      <div className="flex min-h-[60dvh] flex-col lg:h-full lg:min-h-0">
        <div className="pt-safe px-1.5 py-1.5 lg:hidden">
          <BackLink />
        </div>
        <div className="flex flex-1 items-center justify-center px-4">
          <h1 className="sr-only">Conversation not found</h1>
          <EmptyState
            icon={<MessageCircle aria-hidden />}
            title="This conversation is not here"
            description="It may belong to a demo booking that was reset. Pick another conversation."
            action={
              <ButtonLink href="/messages" variant="secondary" size="sm">
                All messages
              </ButtonLink>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:h-full">
      <ThreadHeader thread={thread} booking={booking} />
      <Messages key={thread.id} thread={thread} booking={booking} />
      <Composer key={`c-${thread.id}`} thread={thread} />
    </div>
  );
}

/** Shown for a moment while the conversation id resolves: the header frame, nothing else. */
export function ThreadFallback() {
  return (
    <div className="flex flex-col lg:h-full" aria-busy="true">
      <div className="pt-safe border-b border-line">
        <div className="flex min-h-14 items-center gap-1 px-1.5 py-1.5 lg:min-h-[81px] lg:px-8 lg:py-4">
          <BackLink />
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/messages"
      aria-label="Back to Messages"
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-accent transition-colors hover:bg-fill lg:hidden"
    >
      <ChevronLeft aria-hidden className="size-6" strokeWidth={2} />
    </Link>
  );
}

function ThreadHeader({ thread, booking }: { thread: Thread; booking?: Booking }) {
  return (
    <header className="pt-safe sticky top-0 z-20 shrink-0 border-b border-line bg-paper/92 backdrop-blur-md lg:static lg:bg-paper lg:backdrop-blur-none">
      <div className="flex min-h-14 items-center gap-1 px-1.5 py-1.5 lg:gap-3 lg:px-8 lg:py-4">
        <BackLink />
        <Avatar name={thread.who} className="mr-1.5 size-9 lg:mr-0 lg:size-10" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-body font-medium text-ink lg:text-heading">{thread.who}</h1>
          <p className="flex min-w-0 items-center gap-3 text-caption text-ink-2 lg:text-small">
            <span className="truncate">{contextOf(thread, booking)}</span>
            {booking && <StatusMark status={booking.status} className="hidden shrink-0 xl:inline-flex" />}
          </p>
        </div>
        {booking ? (
          <HeaderLink href={`/bookings/${booking.id}`}>Booking</HeaderLink>
        ) : thread.caretaker ? (
          <HeaderLink href="/caretaker">Caretaker view</HeaderLink>
        ) : null}
      </div>
    </header>
  );
}

/** Accent text on phones, like other compact bars; a secondary button on laptops */
function HeaderLink({ href, children }: { href: string; children: string }) {
  return (
    <ButtonLink
      href={href}
      variant="secondary"
      size="sm"
      className="border-transparent bg-transparent text-accent hover:border-transparent hover:bg-fill lg:border-line-2 lg:bg-surface lg:text-ink lg:hover:border-ink/25"
    >
      {children}
    </ButtonLink>
  );
}

function Messages({ thread, booking }: { thread: Thread; booking?: Booking }) {
  const quickReply = useStore((s) => s.quickReply);
  const scroller = useRef<HTMLDivElement>(null);
  const seen = useRef(0);
  const msgs = thread.msgs;
  const count = msgs.length;

  // Keep the newest message in view: on first show, when the route is shown again, and on every new message.
  useEffect(() => {
    const smooth = seen.current > 0 && count > seen.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    seen.current = count;
    const frame = requestAnimationFrame(() => {
      const behavior: ScrollBehavior = smooth ? "smooth" : "instant";
      const el = scroller.current;
      if (el && el.scrollHeight > el.clientHeight) el.scrollTo({ top: el.scrollHeight, behavior });
      else window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
    });
    return () => cancelAnimationFrame(frame);
  }, [count]);

  let replyAt = -1;
  msgs.forEach((m, i) => {
    if (m.replies?.length) replyAt = i;
  });
  const answered = replyAt >= 0 && msgs.slice(replyAt + 1).some((m) => m.dir === "in");
  const playable = replyAt >= 0 && !!booking && needsAction(booking) && !answered;
  const guest = thread.caretaker ? thread.who : firstName(thread.who);

  return (
    <div ref={scroller} tabIndex={0} role="region" aria-label="Conversation" className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain focus-visible:-outline-offset-2">
      <div
        role="log"
        aria-label={`Messages with ${thread.who}`}
        className="mx-auto flex w-full max-w-3xl flex-col px-3 pt-3 pb-12 sm:px-4 lg:px-8 lg:pt-4 lg:pb-6"
      >
        {msgs.length === 0 && <p className="py-10 text-center text-small text-ink-2">No messages yet. Write the first one below.</p>}
        {msgs.map((m, i) => {
          const prev = msgs[i - 1];
          const day = m.ts.slice(0, 10);
          const newDay = !prev || prev.ts.slice(0, 10) !== day;
          const grouped = !newDay && prev.dir === m.dir && minutesBetween(prev.ts, m.ts) <= 10;
          const speaker = m.dir === "out" ? (m.auto ? "Sent automatically" : "You") : thread.who;
          return (
            <div key={i} className="flex flex-col">
              {newDay && (
                <div className={cn("flex items-center gap-3 pb-3", i === 0 ? "pt-2" : "pt-6")}>
                  <span aria-hidden className="h-px flex-1 bg-line" />
                  <span className="text-caption font-medium text-ink-2">{relDay(m.ts)}</span>
                  <span aria-hidden className="h-px flex-1 bg-line" />
                </div>
              )}
              <Bubble
                dir={m.dir}
                auto={m.auto}
                time={fmtTime(m.ts)}
                text={m.text}
                speaker={speaker}
                replies={i === replyAt ? m.replies : undefined}
                canReply={playable}
                onReply={(r) => quickReply(thread.id, r)}
                className={cn(!newDay && (grouped ? "mt-1" : "mt-3"))}
              />
              {i === replyAt && playable && (
                <p className="mt-2 ml-auto max-w-[min(82%,34rem)] text-right text-caption text-ink-2">
                  These are the buttons {guest} sees. Tap one to play the guest.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Composer({ thread }: { thread: Thread }) {
  const sendMessage = useStore((s) => s.sendMessage);
  const [text, setText] = useState("");
  const inputId = useId();
  const empty = !text.trim();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (empty) return;
    sendMessage(thread.id, text);
    setText("");
  };

  return (
    <form
      onSubmit={submit}
      className={cn(
        "fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom,0px))] z-20 border-t border-line bg-paper/95 backdrop-blur-md",
        "lg:static lg:z-auto lg:shrink-0 lg:bg-paper lg:backdrop-blur-none",
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-3 py-2.5 sm:px-4 lg:px-8 lg:py-4">
        <label htmlFor={inputId} className="sr-only">
          Message to {thread.who}
        </label>
        <input
          id={inputId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${firstName(thread.who)}…`}
          autoComplete="off"
          enterKeyHint="send"
          className={cn(
            "h-11 w-full min-w-0 flex-1 rounded-md border border-line-2 bg-surface px-3.5 text-body text-ink placeholder:text-ink-3",
            "transition-[border-color,box-shadow] duration-150 hover:border-ink/25",
            "focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/15 focus-visible:outline-none",
          )}
        />
        <button
          type="submit"
          aria-label="Send"
          title="Send"
          disabled={empty}
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-md transition-[background-color,color,transform] duration-150 active:scale-95",
            empty ? "bg-fill-2 text-ink-3" : "bg-accent text-white hover:bg-[color-mix(in_srgb,var(--accent)_86%,black)]",
          )}
        >
          <SendHorizontal aria-hidden className="size-5" strokeWidth={1.75} />
        </button>
      </div>
    </form>
  );
}
