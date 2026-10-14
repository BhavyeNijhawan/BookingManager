"use client";

import { useState } from "react";
import { Lock, Moon } from "lucide-react";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { BrandMark } from "@/components/shell/brand";
import { Switch } from "@/components/ui/bits";
import { List, SectionHeader, Surface } from "@/components/ui/surface";
import { SwitchRow } from "./parts";

interface Alert {
  id: string;
  title: string;
  how: string;
  on: boolean;
}

const URGENT: Omit<Alert, "on">[] = [
  { id: "double", title: "Possible double booking", how: "Two bookings for the same nights. Push and WhatsApp, even during quiet hours." },
  {
    id: "open",
    title: "A platform is still open after a booking",
    how: "The nights did not close within 20 minutes, so a second guest could book them. Push and WhatsApp.",
  },
];

const ACT: Alert[] = [
  { id: "verify", title: "Pay-at-property booking needs verification", how: "Push, as soon as the booking lands", on: true },
  { id: "fake", title: "No reply after 24 hours (likely fake)", how: "Push and WhatsApp", on: true },
  { id: "cancel", title: "Guest cancelled or a platform cancelled", how: "Push", on: true },
  { id: "phone", title: "Booking.com phone number to copy", how: "Push, with a link to the Pulse app", on: true },
];

const INFO: Alert[] = [
  { id: "new", title: "New booking on any platform", how: "Push, grouped per booking", on: true },
  { id: "paid", title: "Guest confirmed or paid the advance", how: "Push, grouped per booking", on: true },
  { id: "msg", title: "Guest message on WhatsApp", how: "Push", on: true },
  { id: "checkout", title: "Checkout completed", how: "Push when Ramesh bhai marks it", on: false },
  { id: "summary", title: "Daily summary at 8 AM", how: "WhatsApp and push", on: false },
];

export function NotificationsView() {
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries([...ACT, ...INFO].map((a) => [a.id, a.on])));
  const [quiet, setQuiet] = useState(true);
  const set = (id: string) => (v: boolean) => setOn((s) => ({ ...s, [id]: v }));

  const group = (id: string, title: string, items: Alert[], note: string) => (
    <section aria-labelledby={id}>
      <SectionHeader id={id} title={title} />
      <Surface>
        <List>
          {items.map((a) => (
            <SwitchRow key={a.id} title={a.title} description={a.how} checked={on[a.id]} onCheckedChange={set(a.id)} />
          ))}
        </List>
      </Surface>
      <p className="mt-3 px-1 text-caption text-ink-2">{note}</p>
    </section>
  );

  return (
    <>
      <PageHeader
        back={{ href: "/more", label: "More" }}
        kicker="What reaches your phone"
        title="Notifications"
        description="Push on your phone for everything you choose below. Urgent alerts also come on WhatsApp, so they reach you even if the app is closed."
      />
      <PageBody>
        <div className="grid gap-x-10 gap-y-9 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-9">
            <section aria-labelledby="urgent-h">
              <SectionHeader id="urgent-h" title="Urgent, always on" />
              <Surface>
                <List>
                  {URGENT.map((a) => (
                    <div key={a.id} className="flex items-start gap-4 px-4 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">{a.title}</p>
                        <p className="mt-0.5 text-small text-ink-2">{a.how}</p>
                      </div>
                      <span className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 text-small text-ink-2">
                        <Lock aria-hidden className="size-3.5 text-ink-3" />
                        Always on
                      </span>
                    </div>
                  ))}
                </List>
              </Surface>
              <p className="mt-3 px-1 text-caption text-ink-2">These protect you from two guests arriving for the same nights, so they can’t be switched off.</p>
            </section>
            {group("act-h", "Act today", ACT, "Held during quiet hours and sent at 7 AM.")}
            {group("info-h", "Information", INFO, "Several updates about one booking arrive as one notification.")}
          </div>

          <aside className="flex min-w-0 flex-col gap-9" aria-label="Quiet hours and lock screen">
            <section aria-labelledby="quiet-h">
              <SectionHeader id="quiet-h" title="Quiet hours" />
              <Surface>
                <List>
                  <label className="flex cursor-pointer items-start gap-3 px-4 py-3.5">
                    <Moon aria-hidden className="mt-0.5 size-[18px] shrink-0 text-ink-2" strokeWidth={1.75} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">Quiet hours</span>
                      <span className="tabular block text-small text-ink-2">11 PM to 7 AM</span>
                    </span>
                    <Switch checked={quiet} onCheckedChange={setQuiet} label="Quiet hours, 11 PM to 7 AM" className="mt-0.5" />
                  </label>
                  <p className="px-4 py-3.5 text-small text-ink-2">
                    {quiet
                      ? "Between 11 PM and 7 AM only possible double bookings come through. Everything else waits for the morning."
                      : "Quiet hours are off. Every alert you switched on comes through at any hour."}
                  </p>
                  <p className="px-4 py-3.5 text-small text-ink-2">
                    Guests never get a message between 9:30 PM and 8 AM. Atithi holds it for the morning.
                  </p>
                </List>
              </Surface>
            </section>

            <section aria-labelledby="lock-h">
              <SectionHeader id="lock-h" title="On your lock screen" />
              <Surface className="p-4">
                <figure className="flex items-start gap-3 rounded-lg bg-fill p-3" aria-label="Example notification">
                  <BrandMark className="size-7" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline justify-between gap-2 text-caption text-ink-3">
                      <span className="font-medium text-ink-2">Atithi</span>
                      <span>now</span>
                    </p>
                    <p className="mt-0.5 text-small font-medium text-ink">New MakeMyTrip booking</p>
                    <p className="text-small text-ink-2">Tap to review</p>
                  </div>
                </figure>
                <p className="mt-3 text-small text-ink-2">
                  No guest names or phone numbers on the lock screen. Every notification opens the screen where you can act.
                </p>
              </Surface>
            </section>
          </aside>
        </div>
      </PageBody>
    </>
  );
}
