"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeftRight, ExternalLink, Info, Mail, Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { CHANNEL_CONFIG, CHANNELS, OTAS, TODAY } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { inr, plural } from "@/lib/format";
import { isLive, needsAction } from "@/lib/selectors";
import { openExtranet } from "@/lib/contact";
import type { ChannelConfig, ChannelId } from "@/lib/types";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { KeyValues, SectionHeader, Surface } from "@/components/ui/surface";
import { HealthDot } from "./parts";

const MONTH = TODAY.slice(0, 7);
type SyncState = "syncing" | "done";

export function PlatformsView() {
  const bookings = useStore((s) => s.bookings);
  const openSheet = useStore((s) => s.openSheet);
  const [synced, setSynced] = useState<Partial<Record<ChannelId, SyncState>>>({});
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const mark = (ids: ChannelId[], state: SyncState) =>
    setSynced((s) => ({ ...s, ...Object.fromEntries(ids.map((id) => [id, state])) }));

  const sync = (ids: ChannelId[]) => {
    mark(ids, "syncing");
    timers.current.push(window.setTimeout(() => mark(ids, "done"), 1100));
    toast(ids.length > 1 ? "Syncing every platform" : `Syncing ${CHANNELS[ids[0]].name}`, {
      description: "Atithi asks the channel manager for a full refresh. It usually takes under a minute.",
    });
  };

  const stats = (id: ChannelId) => {
    const list = bookings.filter((b) => b.channel === id && isLive(b) && b.ci.startsWith(MONTH));
    return { count: list.length, value: list.reduce((a, b) => a + b.amount, 0) };
  };
  const waiting = bookings.filter((b) => b.channel === "mmt" && needsAction(b)).length;

  return (
    <>
      <PageHeader
        back={{ href: "/more", label: "More" }}
        kicker="Where your bookings come from"
        title="Platforms and sync"
        description="A booking on any platform closes the same nights on the other three within minutes. This is how each one is connected."
        actions={
          <Button variant="secondary" icon={<RefreshCw aria-hidden />} onClick={() => sync([...OTAS])}>
            Sync all now
          </Button>
        }
        mobileActions={
          <Button variant="ghost" size="sm" className="text-accent" onClick={() => sync([...OTAS])}>
            Sync all
          </Button>
        }
      />
      <PageBody>
        <div className="grid gap-x-10 gap-y-9 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section aria-labelledby="plat-h" className="min-w-0">
            <SectionHeader id="plat-h" title="Platforms and direct bookings" />
            <div className="flex flex-col gap-3">
              {CHANNEL_CONFIG.map((c) => (
                <PlatformCard
                  key={c.id}
                  c={c}
                  stats={stats(c.id)}
                  waiting={c.id === "mmt" ? waiting : 0}
                  state={synced[c.id]}
                  onSync={() => sync([c.id])}
                  onAddDirect={() => openSheet({ kind: "direct" })}
                />
              ))}
            </div>
          </section>

          <aside className="flex min-w-0 flex-col gap-9" aria-label="Channel manager">
            <section aria-labelledby="cm-h">
              <SectionHeader id="cm-h" title="Channel manager" />
              <Surface>
                <div className="flex items-center gap-2.5 px-4 pt-4">
                  <HealthDot />
                  <p className="font-medium text-ink">Working normally</p>
                </div>
                <p className="px-4 pt-1.5 pb-1 text-small text-ink-2">
                  It runs the two-way sync with all four platforms and closes the nights everywhere when a booking lands.
                </p>
                <KeyValues
                  rows={[
                    { k: "Health check", v: "Every 5 minutes" },
                    { k: "Last full reconcile", v: "Today, 12:35 PM" },
                    { k: "Platforms connected", v: "4 of 4" },
                  ]}
                />
              </Surface>
            </section>

            <section aria-labelledby="fb-h">
              <SectionHeader id="fb-h" title="If the sync ever lags" />
              <Surface className="p-4">
                <div className="flex items-start gap-3">
                  <Mail aria-hidden className="mt-0.5 size-[18px] shrink-0 text-ink-3" strokeWidth={1.75} />
                  <div className="min-w-0 text-small text-ink-2">
                    <p className="font-medium text-ink">Emails are the backup</p>
                    <p className="mt-1">
                      Atithi also reads every platform’s confirmation email within a minute. If the channel manager falls behind, it
                      tells you exactly which nights to block by hand, and sends an urgent alert if a platform is still open after 20
                      minutes.
                    </p>
                  </div>
                </div>
              </Surface>
            </section>
          </aside>
        </div>
      </PageBody>
    </>
  );
}

function PlatformCard({
  c,
  stats,
  waiting,
  state,
  onSync,
  onAddDirect,
}: {
  c: ChannelConfig;
  stats: { count: number; value: number };
  waiting: number;
  state?: SyncState;
  onSync: () => void;
  onAddDirect: () => void;
}) {
  const name = CHANNELS[c.id].name;
  const direct = c.id === "direct";
  const syncedText = state === "done" ? "Synced just now" : state === "syncing" ? "Syncing…" : `Synced ${c.last}`;
  return (
    <Surface tone={waiting > 0 ? "alert" : "default"}>
      <div className="flex items-start justify-between gap-4 px-4 pt-4">
        <div className="min-w-0">
          <h3 className="text-heading font-medium text-ink">{direct ? "Direct bookings" : name}</h3>
          <p className="tabular mt-0.5 text-small text-ink-2">
            {stats.count ? `${plural(stats.count, "stay")} in October, ${inr(stats.value)}` : "No stays in October"}
          </p>
        </div>
        {!direct && (
          <p className="mt-1 flex shrink-0 items-center gap-2 text-small text-ink-2" aria-live="polite">
            <HealthDot />
            <span className="tabular">{syncedText}</span>
          </p>
        )}
      </div>

      {waiting > 0 && (
        <p className="mx-4 mt-3 flex items-center gap-2 text-small font-medium text-alert-ink">
          <HealthDot tone="warn" />
          {waiting === 1 ? "1 pay-at-property booking is" : `${waiting} pay-at-property bookings are`} waiting for the guest
        </p>
      )}

      <div className="px-4 pt-3 pb-4">
        <p className="flex items-start gap-2 text-small text-ink">
          <ArrowLeftRight aria-hidden className="mt-[3px] size-3.5 shrink-0 text-ink-3" />
          <span className="min-w-0">{c.method}</span>
        </p>
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-fill px-3 py-2.5 text-small text-ink-2">
          <Info aria-hidden className="mt-[3px] size-3.5 shrink-0 text-ink-3" />
          <span className="min-w-0">{c.note}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 border-t border-line px-4 py-3">
        {c.ext ? (
          <>
            <Button size="sm" variant="secondary" icon={<ExternalLink aria-hidden />} onClick={() => openExtranet(c.ext ?? name)}>
              Open {c.ext}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={state === "syncing"}
              icon={<RefreshCw aria-hidden className={cn(state === "syncing" && "animate-spin")} />}
              onClick={onSync}
              className="ml-auto max-xs:px-2.5"
            >
              <span className="max-xs:sr-only">Sync now</span>
            </Button>
          </>
        ) : (
          <Button size="sm" variant="secondary" icon={<Plus aria-hidden />} onClick={onAddDirect}>
            Add a direct booking
          </Button>
        )}
      </div>
    </Surface>
  );
}
