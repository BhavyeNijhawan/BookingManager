"use client";

import { useState } from "react";
import { TODAY } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { fmtDow, fmtRange, nightsBetween, nightsWord } from "@/lib/format";
import { unitName } from "@/lib/selectors";
import { Button } from "@/components/ui/button";
import { KeyValues } from "@/components/ui/surface";
import { SheetActions, SheetClose, SheetHeader } from "@/components/ui/sheet";

/** A manual block: why, where, and a way to open the nights again. */
export function BlockInfoSheet({ id }: { id: string }) {
  const live = useStore((s) => s.blocks.find((b) => b.id === id));
  // Keep showing the block while the sheet closes after "Unblock".
  const [initial] = useState(() => useStore.getState().blocks.find((b) => b.id === id));
  const unblock = useStore((s) => s.unblock);
  const bl = live ?? initial;
  if (!bl) return <SheetHeader title="This block is gone" description="The nights are open again on every platform." />;
  const over = bl.co <= TODAY;

  return (
    <>
      <SheetHeader
        title={`Blocked, ${fmtRange(bl.ci, bl.co)}`}
        description={`${unitName(bl.unit)} is closed on Airbnb, Booking.com, Agoda and MakeMyTrip for these nights.`}
      />
      <div className="rounded-lg border border-line">
        <KeyValues
          rows={[
            { k: "Reason", v: bl.reason },
            { k: "Unit", v: unitName(bl.unit) },
            { k: "First night", v: fmtDow(bl.ci) },
            { k: "Nights", v: nightsWord(nightsBetween(bl.ci, bl.co)) },
            { k: "Open again from", v: fmtDow(bl.co) },
          ]}
        />
      </div>
      <SheetActions>
        <SheetClose asChild>
          <Button variant="secondary">Close</Button>
        </SheetClose>
        {!over && (
          <Button variant="secondary" onClick={() => unblock(bl.id)}>
            Unblock these nights
          </Button>
        )}
      </SheetActions>
    </>
  );
}
