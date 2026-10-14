"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Info, Landmark } from "lucide-react";
import { cn } from "@/lib/cn";
import { UNITS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/format";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Avatar, Stat } from "@/components/ui/bits";
import { KeyValues, List, SectionHeader, Surface } from "@/components/ui/surface";
import { HealthDot, IconTile, SwitchRow } from "./parts";

/** Recent advances. The status of each is read from the booking, so paying in the demo updates it here. */
const RECENT = [
  { bookingId: "b4", name: "Priya Sharma", amount: 2500, how: "Payment link", date: "9 Oct" },
  { bookingId: "b7", name: "Vikram Singh", amount: 3000, how: "UPI", date: "7 Oct" },
  { bookingId: "b12", name: "Kabir Malhotra", amount: 5000, how: "Card", date: "6 Oct" },
];

export function PaymentsView() {
  const bookings = useStore((s) => s.bookings);
  const remindPay = useStore((s) => s.remindPay);
  // On in the prototype so the demo story (MakeMyTrip guest pays an advance) holds together.
  const [askMmt, setAskMmt] = useState(true);

  const villa = UNITS.find((u) => u.id === "villa");
  const cottage = UNITS.find((u) => u.id === "cottage");

  const recent = RECENT.map((r) => {
    const b = bookings.find((x) => x.id === r.bookingId);
    const adv = b?.pay.mode === "pay_at_property" ? b.pay.advance : null;
    const received = adv?.status === "received";
    const cancelled = b?.status === "cancelled";
    return { ...r, received, cancelled };
  });
  const received = recent.filter((r) => r.received);
  const pending = recent.filter((r) => !r.received && !r.cancelled);

  const toggleMmt = (v: boolean) => {
    setAskMmt(v);
    toast(v ? "MakeMyTrip guests will be asked for an advance" : "MakeMyTrip guests confirm with a WhatsApp yes", {
      description: v ? "Only new bookings get the link. It is worded as optional, never as a condition." : "No payment link goes to MakeMyTrip guests.",
    });
  };

  return (
    <>
      <PageHeader
        back={{ href: "/more", label: "More" }}
        kicker="Advance collection"
        title="Payments"
        description="Advances for pay-at-property and direct bookings are collected with a Razorpay link on WhatsApp."
      />
      <PageBody>
        <div className="grid gap-x-10 gap-y-9 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-9">
            <section aria-labelledby="rzp-h">
              <SectionHeader id="rzp-h" title="Payment account" />
              <Surface>
                <div className="flex items-center gap-3 px-4 pt-4 pb-1">
                  <IconTile>
                    <Landmark />
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">Razorpay</p>
                    <p className="flex items-center gap-2 text-small text-ink-2">
                      <HealthDot />
                      Connected
                    </p>
                  </div>
                </div>
                <KeyValues
                  rows={[
                    { k: "Guests can pay with", v: "UPI, cards, net banking" },
                    { k: "Settles to", v: "HDFC ••4410" },
                    { k: "Settlement", v: "T+2 working days" },
                  ]}
                />
                <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<ExternalLink aria-hidden />}
                    onClick={() => toast("Opening Razorpay", { description: "The real app opens your Razorpay dashboard." })}
                  >
                    Open Razorpay dashboard
                  </Button>
                </div>
              </Surface>
            </section>

            <section aria-labelledby="rules-h">
              <SectionHeader id="rules-h" title="Advance rules" />
              <Surface>
                <List>
                  <div className="px-4 py-3.5">
                    <p className="font-medium text-ink">Pay-at-property bookings</p>
                    <p className="mt-0.5 text-small text-ink-2">
                      Ask for <span className="tabular text-ink">{inr(villa?.advance ?? 3000)}</span> for {villa?.name ?? "the villa"} or{" "}
                      <span className="tabular text-ink">{inr(cottage?.advance ?? 2500)}</span> for {cottage?.name ?? "the cottage"}, paid
                      within 24 hours.
                    </p>
                  </div>
                  <div className="px-4 py-3.5">
                    <p className="font-medium text-ink">Direct bookings</p>
                    <p className="mt-0.5 text-small text-ink-2">Ask for 30% of the stay to confirm the dates.</p>
                  </div>
                  <div className="px-4 py-3.5">
                    <p className="font-medium text-ink">Payment links</p>
                    <p className="mt-0.5 text-small text-ink-2">Expire 24 hours after sending. Then the nights are released.</p>
                  </div>
                  <SwitchRow
                    title="Also ask MakeMyTrip guests for an advance"
                    description={
                      askMmt
                        ? "On: MakeMyTrip guests get an optional advance link after they say yes."
                        : "Off: a WhatsApp “yes” is enough to keep a MakeMyTrip booking."
                    }
                    checked={askMmt}
                    onCheckedChange={toggleMmt}
                  >
                    <span className={cn("mt-2 flex items-start gap-1.5 text-small", askMmt ? "text-alert-ink" : "text-ink-2")}>
                      <Info aria-hidden className="mt-[3px] size-3.5 shrink-0" />
                      Check MakeMyTrip partner terms before turning this on.
                    </span>
                  </SwitchRow>
                </List>
              </Surface>
              <p className="mt-3 px-1 text-caption text-ink-2">
                Airbnb and Booking.com guests never get a payment link. Those platforms do not allow payment outside them.
              </p>
            </section>
          </div>

          <div className="flex min-w-0 flex-col gap-9">
            <section aria-labelledby="sum-h">
              <SectionHeader id="sum-h" title="October advances" />
              <Surface className="grid grid-cols-2 gap-x-5 p-5">
                <Stat
                  label="Received"
                  value={inr(received.reduce((a, r) => a + r.amount, 0))}
                  context={received.length === 1 ? "1 advance" : `${received.length} advances`}
                />
                <Stat
                  label="Waiting"
                  value={inr(pending.reduce((a, r) => a + r.amount, 0))}
                  context={
                    pending.length ? (
                      <span className="text-alert-ink">{pending.length === 1 ? "1 link not paid yet" : `${pending.length} links not paid yet`}</span>
                    ) : (
                      "Nothing waiting"
                    )
                  }
                />
              </Surface>
            </section>

            <section aria-labelledby="recent-h">
              <SectionHeader id="recent-h" title="Recent payments" />
              <Surface>
                <List>
                  {recent.map((r) => {
                    const status = r.received ? "Received" : r.cancelled ? "Cancelled" : "Not paid yet";
                    return (
                      <div key={r.bookingId} className="flex items-center gap-3 px-4 py-3">
                        <Avatar name={r.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/bookings/${r.bookingId}`}
                            className="block truncate font-medium text-ink underline-offset-4 hover:underline"
                          >
                            {r.name}
                          </Link>
                          <p className="truncate text-small text-ink-2">
                            {r.how === "Payment link" ? `Link sent ${r.date}` : `${r.how}, ${r.date}`}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="tabular text-small font-medium text-ink">{inr(r.amount)}</p>
                          <p className={cn("text-caption", r.received || r.cancelled ? "text-ink-3" : "font-medium text-alert-ink")}>{status}</p>
                        </div>
                      </div>
                    );
                  })}
                </List>
                {pending.some((r) => r.bookingId === "b4") && (
                  <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
                    <p className="min-w-0 text-small text-ink-2">The next reminder to Priya goes today at 6 PM.</p>
                    <Button size="sm" variant="secondary" onClick={() => remindPay("b4")}>
                      Resend link now
                    </Button>
                  </div>
                )}
              </Surface>
            </section>
          </div>
        </div>
      </PageBody>
    </>
  );
}
