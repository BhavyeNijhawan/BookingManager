import type { ReactNode } from "react";
import { Reply, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { isHindi } from "./model";

const BOLD = /\*([^*\n]+)\*/g;
const VAR = /\{\{(\w+)\}\}/g;

/** Friendlier names for template fields */
const FIELD: Record<string, string> = {
  guest: "guest name",
  caretaker: "caretaker name",
  caretaker_phone: "caretaker phone",
  maps_link: "maps link",
  review_link: "review link",
  today_hi: "date",
  checkouts_hi: "checkouts",
  checkins_hi: "check-ins",
  tasks_hi: "tasks",
};

function withFields(text: string, key: string, fields: boolean): ReactNode[] {
  if (!fields) return [text];
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(VAR)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    out.push(
      <span key={`${key}-${i++}`} className="font-medium text-accent">
        {FIELD[m[1]] ?? m[1].replace(/_/g, " ")}
      </span>,
    );
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** WhatsApp formatting: *bold* becomes <strong>. With `fields`, {{name}} renders as an accent-coloured field. */
export function RichText({ text, fields = false }: { text: string; fields?: boolean }) {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(BOLD)) {
    const at = m.index ?? 0;
    if (at > last) out.push(...withFields(text.slice(last, at), `t${i}`, fields));
    out.push(
      <strong key={`b${i}`} className="font-semibold">
        {withFields(m[1], `b${i}`, fields)}
      </strong>,
    );
    last = at + m[0].length;
    i++;
  }
  if (last < text.length) out.push(...withFields(text.slice(last), `t${i}`, fields));
  return <>{out}</>;
}

/**
 * One WhatsApp message in the Atithi palette. Outgoing sits right on a quiet fill, incoming
 * sits left on the surface with a hairline. Quick-reply buttons attach underneath, full width,
 * the way WhatsApp shows interactive buttons to the guest.
 */
export function Bubble({
  dir,
  auto,
  time,
  text,
  speaker,
  fields,
  replies,
  canReply,
  repliesPreview,
  onReply,
  className,
}: {
  dir: "in" | "out";
  auto?: boolean;
  /** Shown bottom right, e.g. "10:33 AM" or "Preview" */
  time?: string;
  text: string;
  /** Read out before the message by screen readers: "You", "Rahul Verma" */
  speaker: string;
  /** Render {{fields}} as accent tokens (automation previews) */
  fields?: boolean;
  replies?: string[];
  canReply?: boolean;
  /** Show the buttons as the guest sees them, without making them tappable (automation previews) */
  repliesPreview?: boolean;
  onReply?: (reply: string) => void;
  className?: string;
}) {
  const out = dir === "out";
  return (
    <div className={cn("flex w-full", out ? "justify-end" : "justify-start", className)}>
      <div
        className={cn(
          "relative flex max-w-[min(82%,34rem)] min-w-0 flex-col overflow-hidden rounded-[14px]",
          out ? "rounded-br-[4px] bg-fill-2" : "rounded-bl-[4px] border border-line bg-surface",
        )}
      >
        <span className="sr-only">{speaker}: </span>
        <p
          lang={isHindi(text) ? "hi" : undefined}
          className="px-3 pt-2 text-body break-words whitespace-pre-wrap text-ink [overflow-wrap:anywhere]"
        >
          <RichText text={text} fields={fields} />
        </p>
        <p className="flex items-center justify-end gap-3 px-3 pt-1 pb-1.5 text-[0.6875rem] leading-4">
          {auto && (
            <span className="mr-auto inline-flex items-center gap-1 text-ink-2">
              <Zap aria-hidden className="size-3" strokeWidth={2} />
              Sent automatically
            </span>
          )}
          {time && <span className="tabular text-ink-2">{time}</span>}
        </p>
        {replies && replies.length > 0 && repliesPreview && (
          <ul aria-label="Buttons the guest sees" className="border-t border-line">
            {replies.map((r) => (
              <li
                key={r}
                className="flex min-h-10 items-center justify-center gap-2 border-t border-line px-3 py-2 text-small font-medium text-accent first:border-t-0"
              >
                <Reply aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
                {r}
              </li>
            ))}
          </ul>
        )}
        {replies && replies.length > 0 && !repliesPreview && (
          <div role="group" aria-label="Buttons the guest sees" className="border-t border-line">
            {replies.map((r) => (
              <button
                key={r}
                type="button"
                disabled={!canReply}
                onClick={() => onReply?.(r)}
                className={cn(
                  "flex min-h-10 w-full items-center justify-center gap-2 border-t border-line px-3 py-2 text-small font-medium first:border-t-0",
                  "text-accent transition-[background-color] duration-150 hover:bg-ink/5 active:bg-ink/10",
                  "focus-visible:-outline-offset-2 disabled:cursor-default disabled:text-ink-3 disabled:hover:bg-transparent",
                )}
              >
                <Reply aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
