"use client";

import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import type { Automation } from "@/lib/types";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Stat, Switch } from "@/components/ui/bits";
import { List, SectionHeader, Surface } from "@/components/ui/surface";
import { ruleSentence, runsLine } from "./rules";

/** Every rule Atithi runs, with an on/off switch each. */
export function AutomationsView() {
  const autos = useStore((s) => s.autos);
  const messages = autos.filter((a) => !a.system);
  const builtIn = autos.filter((a) => a.system);
  const on = autos.filter((a) => a.on).length;
  const runs = autos.reduce((n, a) => n + a.runs, 0);

  return (
    <>
      <PageHeader
        back={{ href: "/more", label: "More" }}
        className="lg:[&>a:first-child]:hidden"
        kicker="Rules that run for you"
        title="Automations"
        description="Each rule does one job on its own. Turn a rule off and Atithi stops doing that one thing."
      />
      <PageBody>
        <div className="grid gap-x-10 gap-y-9 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex min-w-0 flex-col gap-9">
            <RuleGroup id="auto-msg" title="Messages on WhatsApp" rules={messages} />
            <RuleGroup id="auto-sys" title="Calendar and bookings" rules={builtIn} />
          </div>

          <aside aria-labelledby="auto-sum" className="flex min-w-0 flex-col">
            <SectionHeader id="auto-sum" title="Last 30 days" />
            <Surface className="grid grid-cols-2 gap-x-5 gap-y-6 p-5 lg:grid-cols-1">
              <Stat label="Rules on" value={`${on} of ${autos.length}`} context={on < autos.length ? `${autos.length - on} turned off` : "All running"} />
              <Stat label="Runs" value={runs} context="Messages sent and dates closed" />
            </Surface>
            <p className="mt-4 flex gap-2 px-1 text-small text-ink-2">
              <MessageCircle aria-hidden className="mt-[3px] size-3.5 shrink-0" strokeWidth={2} />
              Every message goes from your one WhatsApp business number, so guests can reply to it like any chat.
            </p>
          </aside>
        </div>
      </PageBody>
    </>
  );
}

function RuleGroup({ id, title, rules }: { id: string; title: string; rules: Automation[] }) {
  if (!rules.length) return null;
  return (
    <section aria-labelledby={id}>
      <SectionHeader id={id} title={title} count={rules.length} />
      <Surface>
        <List>
          {rules.map((a) => (
            <RuleRow key={a.id} rule={a} />
          ))}
        </List>
      </Surface>
    </section>
  );
}

/** The whole row opens the rule (a stretched link); the switch sits above the link so it never navigates. */
function RuleRow({ rule: a }: { rule: Automation }) {
  const toggleAuto = useStore((s) => s.toggleAuto);
  return (
    <div className="group relative flex items-start gap-4 px-4 py-4 transition-[background-color] duration-150 first:rounded-t-[15px] last:rounded-b-[15px] hover:bg-fill">
      <div className="min-w-0 flex-1">
        <Link
          href={`/more/automations/${a.id}`}
          className="font-medium text-ink after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent"
        >
          {a.name}
        </Link>
        <p className={cn("mt-1 text-small", a.on ? "text-ink-2" : "text-ink-3")}>{ruleSentence(a)}</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-3">
          <span className="tabular">{runsLine(a)}</span>
          {a.system && <span className="text-ink-2">Built in</span>}
          {!a.on && <span className="font-medium text-ink-2">Off</span>}
        </p>
      </div>
      <div className="relative z-10 flex items-center gap-2 pt-0.5">
        <Switch checked={a.on} onCheckedChange={() => toggleAuto(a.id)} label={a.name} />
        <ChevronRight aria-hidden className="hidden size-4 text-ink-3 transition-transform group-hover:translate-x-0.5 sm:block" />
      </div>
    </div>
  );
}
