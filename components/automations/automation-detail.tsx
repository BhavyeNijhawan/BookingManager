"use client";

import { toast } from "sonner";
import { PenLine, Send, Settings2, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { fmtStamp } from "@/lib/format";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Switch } from "@/components/ui/bits";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, KeyValues, SectionHeader, Surface } from "@/components/ui/surface";
import { Bubble } from "@/components/messages/bubble";
import { keepHyphens } from "@/components/messages/keep-hyphens";
import { ASK_BUTTONS, asksGuest, recentRuns, recipientOf, runsLine } from "./rules";

/** One rule: when it runs, what it does, the message it sends and its recent runs. */
export function AutomationDetail({ id }: { id: string }) {
  const rule = useStore((s) => s.autos.find((a) => a.id === id));
  const bookings = useStore((s) => s.bookings);
  const toggleAuto = useStore((s) => s.toggleAuto);

  if (!rule) {
    return (
      <>
        <PageHeader back={{ href: "/more/automations", label: "Automations" }} title="Rule not found" />
        <PageBody>
          <Surface>
            <EmptyState
              icon={<Zap aria-hidden />}
              title="This rule is not here"
              description="Pick a rule from the list of automations."
              action={
                <ButtonLink href="/more/automations" variant="secondary" size="sm">
                  All automations
                </ButtonLink>
              }
            />
          </Surface>
        </PageBody>
      </>
    );
  }

  const runs = recentRuns(rule, bookings);
  const to = recipientOf(rule);

  return (
    <>
      <PageHeader
        back={{ href: "/more/automations", label: "Automations" }}
        kicker={rule.system ? "Built-in rule" : "Automation"}
        title={keepHyphens(rule.name)}
      />
      <PageBody>
        <div className="grid gap-x-10 gap-y-9 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-9">
            <section aria-labelledby="rule-h">
              <SectionHeader id="rule-h" title="The rule" />
              <Surface>
                <dl className="divide-y divide-line">
                  <RuleLine label="When" value={rule.trig} />
                  <RuleLine label="Only if" value={rule.cond} />
                  <RuleLine label="Then" value={rule.act} />
                </dl>
                <div className="flex items-center gap-4 border-t border-line px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-small font-medium text-ink">{rule.on ? "On" : "Off"}</p>
                    <p className="text-caption text-ink-2">{rule.on ? runsLine(rule) : "Atithi skips this step until you turn it back on."}</p>
                  </div>
                  <Switch checked={rule.on} onCheckedChange={() => toggleAuto(rule.id)} label={`${rule.name}, on or off`} />
                </div>
              </Surface>
            </section>

            {rule.tpl ? (
              <section aria-labelledby="tpl-h">
                <SectionHeader id="tpl-h" title={`What ${to} receives`} />
                <Surface className="overflow-hidden">
                  <div className="bg-paper/60 px-3 py-5 sm:px-5">
                    <Bubble
                      dir="out"
                      auto
                      time="Preview"
                      text={rule.tpl}
                      speaker="Message preview"
                      fields
                      replies={asksGuest(rule) ? ASK_BUTTONS : undefined}
                      repliesPreview
                      className={cn(!rule.on && "opacity-60")}
                    />
                  </div>
                  <div className="flex flex-col gap-3 border-t border-line px-4 py-3.5 sm:flex-row sm:items-center">
                    <p className="min-w-0 flex-1 text-caption text-ink-2">
                      <span className="font-medium text-accent">Highlighted words</span> {rule.id === "a5" ? "fill in each morning." : "fill in for each booking."}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<PenLine aria-hidden />}
                        onClick={() =>
                          toast("The message editor is not in this prototype", {
                            description: "In the app you change the wording here and the highlighted fields keep filling in.",
                          })
                        }
                      >
                        Edit message
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Send aria-hidden />}
                        onClick={() =>
                          toast("No test sent, this is a prototype", {
                            description: "In the app the test arrives on your own WhatsApp number in a few seconds.",
                          })
                        }
                      >
                        Send me a test
                      </Button>
                    </div>
                  </div>
                </Surface>
              </section>
            ) : (
              <p className="flex gap-2 rounded-lg bg-fill px-4 py-3 text-small text-ink-2">
                <Settings2 aria-hidden className="mt-[3px] size-4 shrink-0" strokeWidth={1.75} />
                This rule is part of how Atithi works and has no message to edit.
              </p>
            )}
          </div>

          <aside aria-label="Recent runs" className="min-w-0">
            <section aria-labelledby="runs-h">
              <SectionHeader id="runs-h" title="Recent runs" count={runs.length || undefined} />
              <Surface>
                {runs.length ? (
                  <KeyValues rows={runs.map((r) => ({ k: r.who, v: fmtStamp(r.ts) }))} />
                ) : (
                  <p className="px-4 py-5 text-small text-ink-2">No runs in the sample data yet.</p>
                )}
              </Surface>
              <p className="mt-3 px-1 text-caption text-ink-2">{runsLine(rule)}. These are the latest.</p>
            </section>
          </aside>
        </div>
      </PageBody>
    </>
  );
}

function RuleLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3.5 sm:flex-row sm:gap-6">
      <dt className="w-20 shrink-0 text-small text-ink-2">{label}</dt>
      <dd className="min-w-0 text-body text-ink">{value}</dd>
    </div>
  );
}
