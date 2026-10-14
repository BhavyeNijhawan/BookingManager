"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, CircleCheck, IndianRupee, Phone, WifiOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { CITY, OWNER, PROPERTY, TODAY } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { addDays, firstName, fmtTime, inr } from "@/lib/format";
import { isLive, toCollect, unitName } from "@/lib/selectors";
import type { Booking } from "@/lib/types";
import { BrandMark } from "@/components/shell/brand";
import { Button } from "@/components/ui/button";
import { STRINGS, type Lang, type Strings } from "./strings";

const TOMORROW = addDays(TODAY, 1);

/** When the booking's check-in or checkout was marked, from its timeline */
const markedAt = (b: Booking, prefix: string) => {
  const ev = [...b.tl].reverse().find((t) => t.text.startsWith(prefix));
  return ev ? fmtTime(ev.ts) : null;
};

const lateCheckout = (b: Booking) => !!b.note?.toLowerCase().includes("late checkout");

export function CaretakerView() {
  const [lang, setLang] = useState<Lang>("hi");
  const t = STRINGS[lang];
  const bookings = useStore((s) => s.bookings);
  const checkIn = useStore((s) => s.checkIn);
  const checkOut = useStore((s) => s.checkOut);

  const live = bookings.filter(isLive);
  const outs = live.filter((b) => b.co === TODAY);
  const ins = live.filter((b) => b.ci === TODAY);

  const say = (title: string, description?: string) =>
    toast(<span lang={lang}>{title}</span>, description ? { description: <span lang={lang}>{description}</span> } : undefined);

  const callGuest = (b: Booking) => say(t.calling(b.guest.name), b.guest.phone);

  // The store announces caretaker marks in Hindi only. Replace that toast with one in the chosen language.
  const mark = (b: Booking, kind: "in" | "out") => {
    if (kind === "in") checkIn(b.id, "caretaker");
    else checkOut(b.id, "caretaker");
    toast.dismiss();
    say(kind === "in" ? t.guestArrived : t.guestLeft, `${b.guest.name}, ${unitName(b.unit)}`);
  };
  const outsLeft = outs.filter((b) => b.status !== "checked_out").length;
  const insLeft = ins.filter((b) => b.status !== "in_house" && b.status !== "checked_out").length;

  return (
    <div lang={lang} className="text-[1rem] leading-[1.6]">
      {/* Demo strip for whoever is presenting the prototype. Always English. */}
      <div lang="en" className="border-b border-line bg-fill">
        <div className="mx-auto flex max-w-[520px] items-center justify-between gap-3 px-4 py-2">
          <p className="min-w-0 truncate text-caption text-ink-2">Ramesh bhai’s phone</p>
          <Link
            href="/"
            className="-my-1 inline-flex shrink-0 items-center gap-0.5 rounded-sm py-1 text-caption font-medium text-accent underline-offset-4 hover:underline"
          >
            <ChevronLeft aria-hidden className="size-3.5" />
            Owner app
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[520px] px-4 pt-5 pb-[calc(40px+env(safe-area-inset-bottom,0px))]">
        <header>
          <div className="flex items-center justify-between gap-3">
            <div lang="en" className="flex min-w-0 items-center gap-2.5">
              <BrandMark className="size-9" />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-small font-medium text-ink">{PROPERTY}</p>
                <p className="truncate text-caption text-ink-2">{CITY}</p>
              </div>
            </div>
            <LangToggle lang={lang} onChange={setLang} label={t.langLabel} />
          </div>

          <p className="mt-6 text-ink-2">{t.greeting}</p>
          <h1 className="text-[1.625rem] leading-[1.4] font-medium tracking-[-0.01em] text-ink">{t.today(TODAY)}</h1>

          <Button
            variant="secondary"
            size="lg"
            className="mt-4 h-14 w-full rounded-xl text-[1.0625rem]"
            icon={<Phone aria-hidden />}
            onClick={() => say(t.callingOwner(OWNER), "+91 98••• ••301")}
          >
            {t.callOwner}
          </Button>
        </header>

        <Section title={t.checkouts} count={outsLeft}>
          {outs.length === 0 ? (
            <Empty>{t.noCheckouts}</Empty>
          ) : (
            outs.map((b) => {
              const done = b.status === "checked_out";
              if (done) return <DoneRow key={b.id} name={b.guest.name} text={t.doneAt(markedAt(b, "Checked out") ?? fmtTime(`${TODAY}T11:00`))} />;
              const time = lateCheckout(b) ? "1 PM" : "11 AM";
              return (
                <Card key={b.id}>
                  <CardTop
                    name={b.guest.name}
                    meta={`${unitName(b.unit)}, ${t.people(b.guest.pax)}`}
                    time={time}
                    timeNote={lateCheckout(b) ? t.lateCheckout : undefined}
                  />
                  <Actions>
                    <BigButton onClick={() => mark(b, "out")}>{t.guestLeft}</BigButton>
                    <CallButton label={t.callLabel(b.guest.name)} onClick={() => callGuest(b)}>
                      {t.call}
                    </CallButton>
                  </Actions>
                </Card>
              );
            })
          )}
        </Section>

        <Section title={t.checkins} count={insLeft}>
          {ins.length === 0 ? (
            <Empty>{t.noCheckins}</Empty>
          ) : (
            ins.map((b) => {
              const done = b.status === "in_house" || b.status === "checked_out";
              if (done) return <DoneRow key={b.id} name={b.guest.name} text={t.doneAt(markedAt(b, "Checked in") ?? "1 PM")} />;
              const due = toCollect(b);
              return (
                <Card key={b.id}>
                  <CardTop name={b.guest.name} meta={`${unitName(b.unit)}, ${t.people(b.guest.pax)}`} time={t.after("1 PM")} />
                  <p
                    className={cn(
                      "mt-3 flex items-start gap-2.5 rounded-lg px-3.5 py-3",
                      due > 0 ? "border border-line-2 bg-surface font-medium text-ink" : "bg-fill text-ink-2",
                    )}
                  >
                    {due > 0 ? (
                      <IndianRupee aria-hidden className="mt-[5px] size-[18px] shrink-0" strokeWidth={2} />
                    ) : (
                      <Check aria-hidden className="mt-[5px] size-[18px] shrink-0" strokeWidth={2} />
                    )}
                    <span className="min-w-0 tabular-nums">{due > 0 ? t.collect(inr(due)) : t.paid}</span>
                  </p>
                  <Actions>
                    <BigButton onClick={() => mark(b, "in")}>{t.guestArrived}</BigButton>
                    <CallButton label={t.callLabel(b.guest.name)} onClick={() => callGuest(b)}>
                      {t.call}
                    </CallButton>
                  </Actions>
                </Card>
              );
            })
          )}
        </Section>

        <Tasks t={t} onDone={() => say(t.taskToast, t.taskToastSub)} />

        <TomorrowLine t={t} lang={lang} bookings={live} />

        <p className="mt-10 flex items-start gap-3 border-t border-line pt-5 text-ink-2">
          <WifiOff aria-hidden className="mt-[5px] size-[18px] shrink-0 text-ink-3" strokeWidth={1.75} />
          <span className="min-w-0">
            <span className="block text-ink">{t.offline}</span>
            <span className="block text-[0.9375rem] text-ink-2">{t.offlineSub}</span>
          </span>
        </p>
      </div>
    </div>
  );
}

/* ---------- pieces ---------- */

function LangToggle({ lang, onChange, label }: { lang: Lang; onChange: (l: Lang) => void; label: string }) {
  const item = (value: Lang, text: string, textLang: string) => (
    <button
      type="button"
      lang={textLang}
      aria-pressed={lang === value}
      onClick={() => onChange(value)}
      className={cn(
        "inline-flex h-10 items-center rounded-md px-3.5 text-[0.9375rem] transition-[background-color,color] duration-150",
        lang === value ? "bg-surface font-medium text-ink shadow-[0_0_0_1px_var(--color-line)]" : "text-ink-2 hover:text-ink",
      )}
    >
      {text}
    </button>
  );
  return (
    <div role="group" aria-label={label} className="inline-flex shrink-0 gap-1 rounded-lg bg-fill p-1">
      {item("hi", "हिंदी", "hi")}
      {item("en", "English", "en")}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  const id = `ct-${title.replace(/\s+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="mt-9">
      <h2 id={id} className="mb-3 flex items-baseline gap-2 px-1 text-[1.125rem] leading-[1.5] font-medium text-ink">
        {title}
        {count !== undefined && count > 0 && <span className="tabular-nums text-[1rem] font-normal text-ink-3">{count}</span>}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-line bg-surface p-4">{children}</div>;
}

function CardTop({ name, meta, time, timeNote }: { name: string; meta: string; time: string; timeNote?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p lang="en" className="text-[1.125rem] leading-[1.5] font-medium text-ink">
          {name}
        </p>
        <p className="text-ink-2">{meta}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[1.125rem] leading-[1.5] font-medium tabular-nums text-ink">{time}</p>
        {timeNote && <p className="text-[0.9375rem] text-ink-2">{timeNote}</p>}
      </div>
    </div>
  );
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="mt-4 flex gap-2">{children}</div>;
}

function BigButton({ children, onClick, variant = "primary" }: { children: ReactNode; onClick: () => void; variant?: "primary" | "secondary" }) {
  return (
    <Button variant={variant} size="lg" className="h-14 min-w-0 flex-1 rounded-xl text-[1.0625rem]" onClick={onClick}>
      {children}
    </Button>
  );
}

function CallButton({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return (
    <Button variant="secondary" size="lg" aria-label={label} className="h-14 shrink-0 rounded-xl px-4 text-[1.0625rem]" icon={<Phone aria-hidden />} onClick={onClick}>
      {children}
    </Button>
  );
}

function DoneRow({ name, text }: { name: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-surface/60 px-4 py-3">
      <CircleCheck aria-hidden className="mt-[3px] size-5 shrink-0 text-ink-2" strokeWidth={1.75} />
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ink-2">{name}</span>
        <span className="block tabular-nums text-ink-3">{text}</span>
      </span>
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line-2 px-4 py-4 text-ink-2">{children}</p>;
}

function Tasks({ t, onDone }: { t: Strings; onDone: () => void }) {
  const [done, setDone] = useState<Record<string, string | null>>({ clean: null, ready: "11:20 AM" });
  const list = [
    { id: "clean" as const, unit: "Main Villa" },
    { id: "ready" as const, unit: "Garden Cottage" },
  ];
  const left = list.filter((x) => !done[x.id]).length;
  return (
    <Section title={t.tasks} count={left}>
      {list.map(({ id, unit }) => {
        const copy = t.task[id];
        const at = done[id];
        if (at) return <DoneRow key={id} name={copy.title(unit)} text={t.doneAt(at)} />;
        return (
          <Card key={id}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[1.125rem] leading-[1.5] font-medium text-ink">{copy.title(unit)}</p>
                <p className="text-ink-2">{copy.detail}</p>
              </div>
              <p className="shrink-0 text-right font-medium tabular-nums text-ink">{copy.when}</p>
            </div>
            <Actions>
              <BigButton
                variant="secondary"
                onClick={() => {
                  setDone((s) => ({ ...s, [id]: "12:40 PM" }));
                  onDone();
                }}
              >
                <Check aria-hidden className="size-5" />
                {t.markDone}
              </BigButton>
            </Actions>
          </Card>
        );
      })}
    </Section>
  );
}

function TomorrowLine({ t, lang, bookings }: { t: Strings; lang: Lang; bookings: Booking[] }) {
  const arrive = bookings.filter((b) => b.ci === TOMORROW);
  const leave = bookings.filter((b) => b.co === TOMORROW);
  const stay = bookings.filter((b) => b.ci <= TODAY && b.co > TOMORROW);
  const bits: string[] = [];
  if (arrive.length) bits.push(t.tomorrowIn(arrive.map((b) => `${b.guest.name}, ${unitName(b.unit)}`).join("; ")));
  if (leave.length) bits.push(t.tomorrowOut(leave.map((b) => `${b.guest.name}, ${unitName(b.unit)}`).join("; ")));
  if (!bits.length) bits.push(t.tomorrowNone);
  stay.forEach((b) => bits.push(t.stays(firstName(b.guest.name), unitName(b.unit))));
  return (
    <section aria-labelledby="ct-tomorrow" className="mt-9">
      <h2 id="ct-tomorrow" className="mb-2 px-1 text-[1.125rem] leading-[1.5] font-medium text-ink">
        {t.tomorrow}, <span className="font-normal text-ink-2">{t.tomorrowDate(TOMORROW)}</span>
      </h2>
      <p className="px-1 text-ink-2">{bits.join(lang === "hi" ? "। " : ". ")}{lang === "hi" ? "।" : "."}</p>
    </section>
  );
}

