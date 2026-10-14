"use client";

import { useStore } from "@/lib/store";
import { fmtRange } from "@/lib/format";
import { unitName } from "@/lib/selectors";
import { Button } from "@/components/ui/button";
import { SheetActions, SheetClose, SheetHeader } from "@/components/ui/sheet";

/** Confirmation before cancelling a booking and reopening its nights everywhere. */
export function CancelSheet({ id }: { id: string }) {
  const b = useStore((s) => s.bookings.find((x) => x.id === id));
  const cancelRelease = useStore((s) => s.cancelRelease);
  if (!b) return <SheetHeader title="Booking not found" />;
  const mmt = b.channel === "mmt";
  return (
    <>
      <SheetHeader
        title={`Cancel ${b.guest.name}’s booking?`}
        description={`${unitName(b.unit)}, ${fmtRange(b.ci, b.co)}. The nights open again on Airbnb, Booking.com, Agoda and MakeMyTrip, and the guest gets a WhatsApp message.`}
      />
      {mmt && (
        <p className="rounded-lg bg-fill px-4 py-3 text-small text-ink-2">
          MakeMyTrip bookings must also be cancelled on the InGo-MMT extranet. Atithi opens the right page for you after this.
        </p>
      )}
      <SheetActions>
        <SheetClose asChild>
          <Button variant="secondary">Keep booking</Button>
        </SheetClose>
        <Button variant="danger" onClick={() => cancelRelease(b.id)}>
          Cancel and release dates
        </Button>
      </SheetActions>
    </>
  );
}
