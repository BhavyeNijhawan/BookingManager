"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { BedDouble, House, MapPin } from "lucide-react";
import { CARETAKER, CARETAKER_PHONE, CITY, OTAS, OWNER, PROPERTY, UNITS } from "@/lib/seed";
import { inr } from "@/lib/format";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/bits";
import { KeyValues, List, SectionHeader, Surface } from "@/components/ui/surface";
import { IconTile } from "./parts";
import { ConfirmSheet } from "./confirm-sheet";

const editToast = (what: string) => toast(`Editing ${what}`, { description: "The editor opens here in the real app. Every guest message updates." });

export function PropertyView() {
  const [revoked, setRevoked] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const sendLink = () => {
    setRevoked(false);
    toast(revoked ? `New link sent to ${CARETAKER}` : `Link sent to ${CARETAKER} again`, {
      description: `On WhatsApp to ${CARETAKER_PHONE}. It opens with a 4-digit PIN.`,
    });
  };

  return (
    <>
      <PageHeader
        back={{ href: "/more", label: "More" }}
        kicker={`${PROPERTY}, ${CITY}`}
        title="Property and people"
        description="Guests and your caretaker see what is set here. Change it once and every message updates."
      />
      <PageBody>
        <div className="grid gap-x-10 gap-y-9 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-9">
            <section aria-labelledby="units-h">
              <SectionHeader id="units-h" title="Units" count={UNITS.length} />
              <Surface>
                <List>
                  {UNITS.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 px-4 py-3.5">
                      <IconTile>{u.id === "villa" ? <House /> : <BedDouble />}</IconTile>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{u.name}</p>
                        <p className="text-small text-ink-2">{u.meta}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-small text-ink">On {OTAS.length} platforms</p>
                        <p className="tabular text-caption text-ink-3">{inr(u.advance)} advance</p>
                      </div>
                    </div>
                  ))}
                </List>
              </Surface>
            </section>

            <section aria-labelledby="people-h">
              <SectionHeader id="people-h" title="People" count={2} />
              <Surface>
                <List>
                  <div className="flex items-start gap-3 px-4 py-4">
                    <Avatar name={OWNER} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">
                        {OWNER} <span className="font-normal text-ink-2">(you)</span>
                      </p>
                      <p className="text-small text-ink-2">Owner, full access</p>
                      <p className="mt-1 text-small text-ink-3">Alerts by push, urgent ones on WhatsApp too</p>
                    </div>
                  </div>
                  <div className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={CARETAKER} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">{CARETAKER}</p>
                        <p className="text-small text-ink-2">Caretaker, today view only, in Hindi</p>
                        <p className="tabular mt-1 text-small text-ink-3">{CARETAKER_PHONE}</p>
                        <p className="mt-1 text-small text-ink-2">
                          {revoked ? (
                            "Link revoked. The today view stays closed until you send a new one."
                          ) : (
                            <>
                              Link opened today at 8:04 AM.{" "}
                              <Link href="/caretaker" className="font-medium text-accent underline-offset-4 hover:underline">
                                Open caretaker view
                              </Link>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1 pl-[52px]">
                      <Button size="sm" variant="ghost" className="-ml-3 text-accent" onClick={sendLink}>
                        {revoked ? "Send a new link" : "Send link again"}
                      </Button>
                      {!revoked && (
                        <Button size="sm" variant="ghost" className="text-alert-ink" onClick={() => setConfirmRevoke(true)}>
                          Revoke link
                        </Button>
                      )}
                    </div>
                  </div>
                </List>
              </Surface>
            </section>
          </div>

          <div className="flex min-w-0 flex-col gap-9">
            <section aria-labelledby="rules-h">
              <SectionHeader
                id="rules-h"
                title="House rules sent to guests"
                action={
                  <Button size="sm" variant="link" aria-label="Edit house rules" onClick={() => editToast("house rules")}>
                    Edit
                  </Button>
                }
              />
              <Surface>
                <KeyValues
                  rows={[
                    { k: "Check-in", v: "From 1 PM" },
                    { k: "Checkout", v: "By 11 AM" },
                    { k: "Quiet hours", v: "After 10 PM" },
                    { k: "Parties", v: "Not allowed" },
                    { k: "Pets", v: "On request" },
                  ]}
                />
              </Surface>
              <p className="mt-3 px-1 text-caption text-ink-2">Sent with every booking confirmation and again with the check-in details.</p>
            </section>

            <section aria-labelledby="ci-h">
              <SectionHeader
                id="ci-h"
                title="Check-in instructions"
                action={
                  <Button size="sm" variant="link" aria-label="Edit check-in instructions" onClick={() => editToast("check-in instructions")}>
                    Edit
                  </Button>
                }
              />
              <Surface>
                <div className="px-4 pt-4 pb-3">
                  <p className="text-body text-ink">
                    {CARETAKER} meets you at the gate and shows you around. There is parking for two cars inside the compound. The Wi-Fi
                    password is on the card by the door. Please call Ramesh bhai 30 minutes before you arrive.
                  </p>
                  <p className="mt-3 flex items-start gap-2 text-small text-ink-2">
                    <MapPin aria-hidden className="mt-[3px] size-3.5 shrink-0 text-ink-3" />
                    <span className="min-w-0">
                      {PROPERTY}, Tungarli, {CITY} 410403, maps.app.goo.gl/amberwood
                    </span>
                  </p>
                </div>
                <KeyValues
                  className="border-t border-line"
                  rows={[
                    { k: "Sent", v: "The day before check-in, 9 AM" },
                    { k: "Caretaker’s number", v: CARETAKER_PHONE },
                  ]}
                />
              </Surface>
            </section>
          </div>
        </div>
      </PageBody>

      <ConfirmSheet
        open={confirmRevoke}
        onOpenChange={setConfirmRevoke}
        title={`Revoke ${CARETAKER}’s link?`}
        description="The today view stays closed on the caretaker’s phone until you send a new link. The 8 AM briefing on WhatsApp still goes out."
        cancelLabel="Keep the link"
        confirmLabel="Revoke link"
        onConfirm={() => {
          setRevoked(true);
          toast("Link revoked", { description: `${CARETAKER} can no longer open the today view.` });
        }}
      />
    </>
  );
}
