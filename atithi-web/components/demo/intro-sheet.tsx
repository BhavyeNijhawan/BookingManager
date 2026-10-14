"use client";

import type { LucideIcon } from "lucide-react";
import { CalendarDays, Info, MessageCircle, Play, Smartphone, Sun } from "lucide-react";
import { CARETAKER, CITY, PROPERTY } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { needsAction } from "@/lib/selectors";
import { Button } from "@/components/ui/button";
import { SheetActions, SheetHeader } from "@/components/ui/sheet";

/** First visit: what Atithi is, what this prototype is, and where to look first. */
export function IntroSheet() {
  const need = useStore((s) => s.bookings.filter(needsAction).length);
  const openSheet = useStore((s) => s.openSheet);
  const closeSheet = useStore((s) => s.closeSheet);

  const tries: { icon: LucideIcon; title: string; body: string }[] = [
    {
      icon: Sun,
      title: "Today",
      body:
        need > 0
          ? `${need === 1 ? "One booking needs" : `${need} bookings need`} you. Open one to see what Atithi already did.`
          : "Who leaves, who arrives, and whether every platform is closed.",
    },
    { icon: Play, title: "Run the demo", body: "A MakeMyTrip pay-at-property booking, from the first message to the paid advance." },
    { icon: CalendarDays, title: "Calendar", body: "Both units on one chart. Tap any date to see who is staying." },
    { icon: MessageCircle, title: "Messages", body: "Open Rahul Verma’s chat and tap a quick-reply button to play the guest." },
    { icon: Smartphone, title: "Caretaker view", body: `What ${CARETAKER} sees, in Hindi, at /caretaker.` },
  ];

  return (
    <>
      <SheetHeader
        kicker="Welcome"
        title="This is Atithi"
        description="Every booking from Airbnb, Booking.com, Agoda and MakeMyTrip in one place, the same nights closed everywhere, and pay-at-property guests checked on WhatsApp."
      />

      <p className="flex gap-3 rounded-lg bg-fill px-4 py-3 text-small text-ink-2">
        <Info aria-hidden className="mt-[3px] size-4 shrink-0 text-ink-2" strokeWidth={1.75} />
        <span>
          A prototype with sample data for{" "}
          <span className="text-ink">
            {PROPERTY}, {CITY}
          </span>
          . The clock is frozen at Sunday 11 October, 12:40 PM. Nothing sends a real message.
        </span>
      </p>

      <h3 className="mt-5 mb-1 text-small font-medium text-ink">Things to try</h3>
      <ul className="divide-y divide-line">
        {tries.map((t) => (
          <li key={t.title} className="flex items-start gap-3 py-2.5 lg:py-3">
            <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-md bg-fill text-ink-2">
              <t.icon className="size-4" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-body font-medium text-ink">{t.title}</span>
              <span className="block text-small text-ink-2">{t.body}</span>
            </span>
          </li>
        ))}
      </ul>

      <SheetActions>
        <Button variant="secondary" icon={<Play aria-hidden />} onClick={() => openSheet({ kind: "demo" })}>
          Run the demo
        </Button>
        <Button variant="primary" onClick={closeSheet}>
          Start
        </Button>
      </SheetActions>
    </>
  );
}
