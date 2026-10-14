"use client";

import { useState, type ReactNode } from "react";
import { BookOpen, Play, RotateCcw, Smartphone } from "lucide-react";
import { CARETAKER, CITY, PROPERTY, UNITS } from "@/lib/seed";
import { PALETTES } from "@/lib/palette";
import { useStore } from "@/lib/store";
import { needsAction } from "@/lib/selectors";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { MANAGE_NAV, SETTINGS_NAV, type NavItem } from "@/components/shell/nav";
import { BrandMark } from "@/components/shell/brand";
import { List, ListRow, SectionHeader, Surface } from "@/components/ui/surface";
import { IconTile } from "./parts";
import { ConfirmSheet } from "./confirm-sheet";
import { usePalette } from "./use-palette";

function Group({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <SectionHeader id={id} title={title} />
      <Surface>
        <List>{children}</List>
      </Surface>
    </section>
  );
}

function NavRow({ item, subtitle, meta }: { item: NavItem; subtitle: ReactNode; meta?: ReactNode }) {
  const Icon = item.icon;
  return (
    <ListRow
      href={item.href}
      leading={
        <IconTile>
          <Icon />
        </IconTile>
      }
      title={item.label}
      subtitle={subtitle}
      meta={meta}
      chevron
    />
  );
}

export function MoreView() {
  const autos = useStore((s) => s.autos);
  const bookings = useStore((s) => s.bookings);
  const openSheet = useStore((s) => s.openSheet);
  const reset = useStore((s) => s.reset);
  const [palette] = usePalette();
  const [confirmReset, setConfirmReset] = useState(false);

  const on = autos.filter((a) => a.on).length;
  const waiting = bookings.filter((b) => b.channel === "mmt" && needsAction(b)).length;
  const paletteName = PALETTES.find((p) => p.id === palette)?.name ?? "Paper";

  const subtitles: Record<string, ReactNode> = {
    "/more/automations": `${autos.length} rules, ${on} on`,
    "/more/platforms": "Airbnb, Booking.com, Agoda, MakeMyTrip",
    "/more/reports": "Bookings, occupancy, platform mix",
    "/more/payments": "Razorpay, settles to HDFC ••4410",
    "/more/property": `${UNITS.length} units, 2 people, house rules`,
    "/more/notifications": "Quiet hours 11 PM to 7 AM",
    "/more/appearance": `${paletteName} palette`,
  };
  const metas: Record<string, ReactNode> = {
    "/more/platforms": waiting > 0 ? <span className="text-alert-ink">{waiting} waiting</span> : undefined,
  };

  return (
    <>
      <PageHeader kicker={`${PROPERTY}, ${CITY}`} title="More" />
      <PageBody>
        <div className="grid gap-x-10 gap-y-9 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-9">
            <Group id="manage-h" title="Manage">
              {MANAGE_NAV.map((it) => (
                <NavRow key={it.href} item={it} subtitle={subtitles[it.href]} meta={metas[it.href]} />
              ))}
            </Group>
            <Group id="settings-h" title="Settings">
              {SETTINGS_NAV.map((it) => (
                <NavRow key={it.href} item={it} subtitle={subtitles[it.href]} />
              ))}
            </Group>
          </div>

          <div className="flex min-w-0 flex-col gap-9">
            <Group id="proto-h" title="This prototype">
              <ListRow
                onClick={() => openSheet({ kind: "demo" })}
                leading={
                  <IconTile className="bg-accent-soft text-accent">
                    <Play />
                  </IconTile>
                }
                title="Run the demo"
                subtitle="The MakeMyTrip story, step by step"
                chevron
              />
              <ListRow
                onClick={() => openSheet({ kind: "intro" })}
                leading={
                  <IconTile>
                    <BookOpen />
                  </IconTile>
                }
                title="How to use this demo"
                subtitle="What to tap first"
                chevron
              />
              <ListRow
                href="/caretaker"
                leading={
                  <IconTile>
                    <Smartphone />
                  </IconTile>
                }
                title="Caretaker view"
                subtitle={`What ${CARETAKER} sees, in Hindi`}
                chevron
              />
              <ListRow
                onClick={() => setConfirmReset(true)}
                leading={
                  <IconTile>
                    <RotateCcw />
                  </IconTile>
                }
                title="Reset sample data"
                subtitle="Back to Sunday 11 October, 12:40 PM"
                chevron
              />
            </Group>

            <div className="flex items-start gap-3 px-1">
              <BrandMark className="size-6" />
              <p className="text-small text-ink-2">
                Atithi prototype with sample data. Nothing here sends a real message.
              </p>
            </div>
          </div>
        </div>
      </PageBody>

      <ConfirmSheet
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset the sample data?"
        description="Every booking, message and automation goes back to how it was on Sunday 11 October at 12:40 PM. Anything you changed in this demo is lost."
        cancelLabel="Keep my changes"
        confirmLabel="Reset sample data"
        onConfirm={reset}
      />
    </>
  );
}
