"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BedDouble, CalendarDays, ChevronRight, CircleCheck, History, Plus, Search, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { CHANNELS, PROPERTY, TODAY } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { dayOfMonth, fmtMonth, fmtRange, fmtWeekday, guestsWord, inr, nightsWord, relDay } from "@/lib/format";
import { STATUS, advanceOf, byCheckIn, channelName, isLive, moneyLine, moneyShort, needsAction, nights, unitName } from "@/lib/selectors";
import type { Booking, ChannelId } from "@/lib/types";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Button, IconButton } from "@/components/ui/button";
import { Segmented } from "@/components/ui/bits";
import { Input, Select } from "@/components/ui/field";
import { StatusMark } from "@/components/ui/status";
import { EmptyState, List, SectionHeader, Surface } from "@/components/ui/surface";
import { digits } from "./availability";

export type View = "action" | "upcoming" | "staying" | "past" | "cancelled";

const VIEWS: { value: View; label: string; empty: { icon: ReactNode; title: string; text: string } }[] = [
  {
    value: "action",
    label: "Needs action",
    empty: { icon: <CircleCheck aria-hidden />, title: "Nothing needs you right now", text: "Every booking is verified and paid where it should be." },
  },
  {
    value: "upcoming",
    label: "Upcoming",
    empty: { icon: <CalendarDays aria-hidden />, title: "No upcoming bookings", text: "New bookings from every platform land here within minutes." },
  },
  {
    value: "staying",
    label: "Staying",
    empty: { icon: <BedDouble aria-hidden />, title: "Nobody is staying right now", text: "Guests show here from check-in until they leave." },
  },
  {
    value: "past",
    label: "Past",
    empty: { icon: <History aria-hidden />, title: "No past stays yet", text: "Stays move here once the guests check out." },
  },
  {
    value: "cancelled",
    label: "Cancelled",
    empty: { icon: <XCircle aria-hidden />, title: "No cancelled bookings", text: "Cancelled bookings and fakes you released show here." },
  },
];

const PLATFORMS = Object.keys(CHANNELS) as ChannelId[];

function inView(b: Booking, v: View) {
  switch (v) {
    case "action":
      return needsAction(b);
    case "upcoming":
      return b.status === "confirmed" && b.ci >= TODAY;
    case "staying":
      return b.status === "in_house" || (b.status === "confirmed" && b.ci < TODAY && b.co > TODAY);
    case "past":
      return b.status === "checked_out" || (b.status === "confirmed" && b.co <= TODAY && b.ci < TODAY);
    case "cancelled":
      return b.status === "cancelled";
  }
}

/** Guest name, phone or platform reference. Punctuation and spaces are ignored. */
function matches(b: Booking, q: string) {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  const flat = (s: string) => s.toLowerCase().replace(/[\s.\-]/g, "");
  if (b.guest.name.toLowerCase().includes(t)) return true;
  if (flat(b.ref).includes(flat(t))) return true;
  const d = digits(t);
  return d.length >= 3 && digits(b.guest.phone).includes(d);
}

const parseView = (v: string | null) => (VIEWS.some((x) => x.value === v) ? (v as View) : null);
const parsePlatform = (v: string | null) => (PLATFORMS.includes(v as ChannelId) ? (v as ChannelId) : null);

function href(view: View | null, platform: ChannelId | null, q: string) {
  const p = new URLSearchParams();
  if (view) p.set("view", view);
  if (platform) p.set("platform", platform);
  if (q.trim()) p.set("q", q.trim());
  const s = p.toString();
  return s ? `/bookings?${s}` : "/bookings";
}

/** Reads the filters from the URL. Needs a Suspense boundary above it. */
export function BookingsFromUrl() {
  const sp = useSearchParams();
  return <BookingsView view={parseView(sp.get("view"))} platform={parsePlatform(sp.get("platform"))} q={sp.get("q") ?? ""} />;
}

export function BookingsView({ view: viewParam, platform, q }: { view: View | null; platform: ChannelId | null; q: string }) {
  const bookings = useStore((s) => s.bookings);
  const openSheet = useStore((s) => s.openSheet);

  // The search box answers each key at once; the URL follows quietly.
  const [text, setText] = useState(q);
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    setText(q);
  }

  const view: View = viewParam ?? (bookings.some(needsAction) ? "action" : "upcoming");
  const scoped = bookings.filter((b) => (!platform || b.channel === platform) && matches(b, text));
  const list = scoped
    .filter((b) => inView(b, view))
    .sort((a, b) => (view === "past" || view === "cancelled" ? b.ci.localeCompare(a.ci) : byCheckIn(a, b)));
  const groups = groupByMonth(list);
  const meta = VIEWS.find((v) => v.value === view)!;

  const replaceUrl = (next: { platform?: ChannelId | null; q?: string }) => {
    const url = href(viewParam, next.platform !== undefined ? next.platform : platform, next.q !== undefined ? next.q : text);
    window.history.replaceState(null, "", url);
  };

  const actions = (
    <Button variant="primary" icon={<Plus aria-hidden />} onClick={() => openSheet({ kind: "direct" })}>
      Add booking
    </Button>
  );
  const mobileActions = (
    <IconButton label="Add a direct booking" onClick={() => openSheet({ kind: "direct" })} className="text-accent">
      <Plus aria-hidden strokeWidth={2} />
    </IconButton>
  );

  return (
    <>
      <PageHeader kicker={PROPERTY} title="Bookings" actions={actions} mobileActions={mobileActions} />
      <PageBody>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <Segmented
            label="Show bookings"
            value={view}
            items={VIEWS.map((v) => {
              const count = scoped.filter((b) => inView(b, v.value)).length;
              return { value: v.value, label: v.label, count, tone: v.value === "action" ? "alert" : undefined, href: href(v.value, platform, text) };
            })}
          />
          <div className="flex gap-2 lg:w-[440px] lg:shrink-0">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="bk-q" className="sr-only">
                Search by guest name, phone or platform reference
              </label>
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
              <Input
                id="bk-q"
                type="search"
                name="q"
                autoComplete="off"
                enterKeyHint="search"
                spellCheck={false}
                placeholder="Name, phone or ref…"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  replaceUrl({ q: e.target.value });
                }}
                className="h-10 pl-9"
              />
            </div>
            <div className="w-[9.5rem] shrink-0">
              <label htmlFor="bk-platform" className="sr-only">
                Platform
              </label>
              <Select
                id="bk-platform"
                value={platform ?? "all"}
                onChange={(e) => replaceUrl({ platform: e.target.value === "all" ? null : (e.target.value as ChannelId) })}
                className="h-10"
              >
                <option value="all">All platforms</option>
                {PLATFORMS.map((c) => (
                  <option key={c} value={c}>
                    {CHANNELS[c].name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <p role="status" className="sr-only">
          {list.length === 1 ? "1 booking" : `${list.length} bookings`}
        </p>
        <div className="mt-6">
          {list.length === 0 ? (
            <Surface>
              {text.trim() ? (
                <EmptyState
                  icon={<Search aria-hidden />}
                  title={`No ${meta.label.toLowerCase()} bookings match “${text.trim()}”`}
                  description="Search looks at guest names, phone numbers and platform references."
                  action={
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setText("");
                        replaceUrl({ q: "" });
                      }}
                    >
                      Clear search
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={meta.empty.icon}
                  title={platform ? `${meta.empty.title} from ${CHANNELS[platform].name}` : meta.empty.title}
                  description={meta.empty.text}
                  action={
                    platform ? (
                      <Button size="sm" variant="secondary" onClick={() => replaceUrl({ platform: null })}>
                        Show all platforms
                      </Button>
                    ) : undefined
                  }
                />
              )}
            </Surface>
          ) : (
            <>
              <PhoneList groups={groups} />
              <LaptopTable groups={groups} caption={`${meta.label} bookings${platform ? ` from ${CHANNELS[platform].name}` : ""}`} />
            </>
          )}
        </div>
      </PageBody>
    </>
  );
}

type Group = { ym: string; items: Booking[] };

function groupByMonth(list: Booking[]): Group[] {
  const out: Group[] = [];
  for (const b of list) {
    const ym = b.ci.slice(0, 7);
    const g = out.find((x) => x.ym === ym);
    if (g) g.items.push(b);
    else out.push({ ym, items: [b] });
  }
  return out;
}

/* ---------- phones: grouped rows with a date tile ---------- */

function PhoneList({ groups }: { groups: Group[] }) {
  return (
    <div className="flex flex-col gap-8 lg:hidden">
      {groups.map((g) => (
        <section key={g.ym} aria-labelledby={`m-${g.ym}`}>
          <SectionHeader id={`m-${g.ym}`} title={fmtMonth(g.ym)} count={g.items.length} />
          <Surface>
            <List>
              {g.items.map((b) => (
                <PhoneRow key={b.id} b={b} />
              ))}
            </List>
          </Surface>
        </section>
      ))}
    </div>
  );
}

function DateTile({ date, faded }: { date: string; faded?: boolean }) {
  const today = date === TODAY;
  return (
    <span
      aria-hidden
      className={cn(
        "flex w-11 shrink-0 flex-col items-center rounded-lg py-1.5",
        today ? "bg-ink text-paper" : "bg-fill",
        faded && !today && "text-ink-3",
      )}
    >
      <span className="tabular text-heading leading-6 font-medium">{dayOfMonth(date)}</span>
      <span className={cn("text-micro", today ? "text-paper/80" : faded ? "text-ink-3" : "text-ink-2")}>{today ? "Today" : fmtWeekday(date)}</span>
    </span>
  );
}

/** A few words under the status in the table: what the status is waiting on */
function statusNote(b: Booking) {
  const adv = advanceOf(b);
  if (b.status === "unverified") return "No reply on WhatsApp yet";
  if (b.status === "verified") return adv ? `${inr(adv.amount)} advance unpaid` : "";
  if (b.status === "flagged") return "No reply, no advance";
  if (b.status === "in_house") return `Leaves ${relDay(b.co).toLowerCase()}`;
  if (b.status === "confirmed" && adv?.status === "received") return `${inr(adv.amount)} advance paid`;
  return "";
}

function PhoneRow({ b }: { b: Booking }) {
  const past = STATUS[b.status].past;
  return (
    <Link
      href={`/bookings/${b.id}`}
      className="group flex items-start gap-3 px-4 py-3.5 transition-[background-color] duration-150 first:rounded-t-[15px] last:rounded-b-[15px] hover:bg-fill"
    >
      <DateTile date={b.ci} faded={past} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className={cn("min-w-0 truncate font-medium", past ? "text-ink-2" : "text-ink")}>{b.guest.name}</span>
          <span className={cn("tabular shrink-0 text-small font-medium", past ? "text-ink-3" : "text-ink")}>{inr(b.amount)}</span>
        </span>
        <span className="mt-0.5 block text-small text-ink-2">
          {unitName(b.unit)}, {nightsWord(nights(b))}, {channelName(b)}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <StatusMark status={b.status} />
          {b.pay.mode !== "platform" && isLive(b) && <span className="tabular text-small text-ink-3">{moneyLine(b)}</span>}
        </span>
      </span>
      <ChevronRight aria-hidden className="mt-3 size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/* ---------- laptops: a real table ---------- */

function LaptopTable({ groups, caption }: { groups: Group[]; caption: string }) {
  const router = useRouter();
  const th = "px-4 py-2.5 text-small font-medium text-ink-2";
  return (
    <Surface className="hidden overflow-hidden lg:block">
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <colgroup>
          <col className="w-[22%]" />
          <col className="w-[14%]" />
          <col className="w-[15%]" />
          <col className="w-[13%]" />
          <col className="w-[14%]" />
          <col />
        </colgroup>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className={cn(th, "pl-5")}>
              Guest
            </th>
            <th scope="col" className={th}>
              Stay
            </th>
            <th scope="col" className={th}>
              Unit
            </th>
            <th scope="col" className={th}>
              Platform
            </th>
            <th scope="col" className={cn(th, "text-right")}>
              Amount
            </th>
            <th scope="col" className={cn(th, "pr-5")}>
              Status
            </th>
          </tr>
        </thead>
        {groups.map((g) => (
          <tbody key={g.ym}>
            <tr>
              <th scope="colgroup" colSpan={6} className="border-b border-line bg-paper/70 px-5 py-2 text-left text-small font-medium text-ink">
                {fmtMonth(g.ym)} <span className="tabular ml-1.5 font-normal text-ink-3">{g.items.length}</span>
              </th>
            </tr>
            {g.items.map((b) => {
              const past = STATUS[b.status].past;
              const to = `/bookings/${b.id}`;
              const soon = b.ci === TODAY || relDay(b.ci) === "Tomorrow";
              return (
                <tr
                  key={b.id}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("a")) return;
                    router.push(to);
                  }}
                  className="group cursor-pointer border-b border-line align-top transition-[background-color] duration-150 last:border-b-0 hover:bg-fill"
                >
                  <td className="py-3 pr-4 pl-5">
                    <Link
                      href={to}
                      className={cn("block truncate font-medium underline-offset-4 group-hover:underline", past ? "text-ink-2" : "text-ink")}
                    >
                      {b.guest.name}
                    </Link>
                    <span className="tabular block truncate text-caption text-ink-3">{b.ref}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("tabular block", past ? "text-ink-2" : "text-ink")}>{fmtRange(b.ci, b.co)}</span>
                    <span className="block text-caption text-ink-3">
                      {soon ? `${relDay(b.ci)}, ${nightsWord(nights(b))}` : nightsWord(nights(b))}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block truncate text-ink-2">{unitName(b.unit)}</span>
                    <span className="block text-caption text-ink-3">{guestsWord(b.guest.pax)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block truncate text-ink-2">{channelName(b)}</span>
                    <span className="block text-caption text-ink-3">{b.pay.mode === "platform" ? "Prepaid" : "Pay at property"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("tabular block font-medium", past ? "text-ink-3" : "text-ink")}>{inr(b.amount)}</span>
                    {isLive(b) && b.status !== "checked_out" && (
                      <span className="tabular block text-caption whitespace-nowrap text-ink-3">{moneyShort(b)}</span>
                    )}
                  </td>
                  <td className="py-3 pr-5 pl-4">
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <StatusMark status={b.status} />
                        {statusNote(b) && <span className="tabular block truncate text-caption text-ink-3">{statusNote(b)}</span>}
                      </span>
                      <ChevronRight aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </Surface>
  );
}
