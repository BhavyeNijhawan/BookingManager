"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { TODAY, UNITS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { addDays, fmtDow } from "@/lib/format";
import type { UnitId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { SheetActions, SheetClose, SheetHeader } from "@/components/ui/sheet";
import { calendarHref } from "@/components/calendar/href";
import { clashFor, freeUnit } from "./availability";
import { Availability, FormError, Pair, toInt } from "./form-bits";

const REASONS = ["Own stay", "Maintenance", "Deep cleaning"];

/** Close nights by hand: an owner's stay, repairs, a deep clean. */
export function BlockForm({ date, unit }: { date?: string; unit?: UnitId }) {
  const router = useRouter();
  const bookings = useStore((s) => s.bookings);
  const blocks = useStore((s) => s.blocks);
  const addBlock = useStore((s) => s.addBlock);

  const [start] = useState(() => {
    const st = useStore.getState();
    const ci = date && date >= TODAY ? date : addDays(TODAY, 1);
    return { ci, unit: unit ?? freeUnit(st.bookings, st.blocks, ci, 1) ?? UNITS[0].id };
  });
  const [unitId, setUnitId] = useState<UnitId>(start.unit);
  const [ci, setCi] = useState(start.ci);
  const [n, setN] = useState("1");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ ci?: string; n?: string }>({});
  const [failed, setFailed] = useState<string | null>(null);

  const nights = toInt(n);
  const datesOk = !!ci && ci >= TODAY && nights >= 1 && nights <= 60;
  const clash = datesOk ? clashFor(bookings, blocks, unitId, ci, nights) : null;
  const co = datesOk ? addDays(ci, nights) : null;

  const edit = (fn: () => void, key?: "ci" | "n") => {
    fn();
    setFailed(null);
    if (key && errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const e: typeof errors = {};
    if (!ci) e.ci = "Pick a date.";
    else if (ci < TODAY) e.ci = "From today on.";
    if (!(nights >= 1)) e.n = "At least 1 night.";
    else if (nights > 60) e.n = "60 nights at most.";
    setErrors(e);
    if (e.ci || e.n) {
      document.getElementById(e.ci ? "bf-ci" : "bf-n")?.focus();
      return;
    }
    const res = addBlock({ unit: unitId, ci, nights, reason });
    if (!res.ok) {
      setFailed(res.reason);
      return;
    }
    router.push(calendarHref(ci.slice(0, 7), unitId));
  }

  return (
    <>
      <SheetHeader title="Block dates" description="Closes the nights on Airbnb, Booking.com, Agoda and MakeMyTrip. Nobody can book them anywhere." />
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Unit" htmlFor="bf-unit">
          <Select id="bf-unit" name="unit" value={unitId} onChange={(e) => edit(() => setUnitId(e.target.value as UnitId))}>
            {UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </Field>
        <Pair>
          <Field label="First night" htmlFor="bf-ci" error={errors.ci}>
            <Input
              id="bf-ci"
              name="first-night"
              type="date"
              min={TODAY}
              value={ci}
              aria-invalid={!!errors.ci || undefined}
              onChange={(e) => edit(() => setCi(e.target.value), "ci")}
            />
          </Field>
          <Field label="Nights" htmlFor="bf-n" error={errors.n}>
            <Input
              id="bf-n"
              name="nights"
              inputMode="numeric"
              autoComplete="off"
              value={n}
              aria-invalid={!!errors.n || undefined}
              onChange={(e) => edit(() => setN(e.target.value), "n")}
            />
          </Field>
        </Pair>
        {co && !failed && <Availability clash={clash} free={`Open again from ${fmtDow(co)}.`} />}
        <Field label="Reason" htmlFor="bf-reason" hint="Only you see this.">
          <Input
            id="bf-reason"
            name="reason"
            autoComplete="off"
            placeholder="Own stay, maintenance…"
            value={reason}
            onChange={(e) => edit(() => setReason(e.target.value))}
          />
        </Field>
        <div role="group" aria-label="Common reasons" className="-mt-1 flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={reason === r}
              onClick={() => edit(() => setReason(r))}
              className={cn(
                "h-8 rounded-full border px-3 text-small transition-[background-color,border-color,color] duration-150",
                reason === r ? "border-ink/30 bg-fill-2 font-medium text-ink" : "border-line-2 text-ink-2 hover:border-ink/25 hover:text-ink",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        {failed && <FormError>{failed}</FormError>}
        <SheetActions className="mt-2">
          <SheetClose asChild>
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <Button type="submit" variant="primary">
            Block on every platform
          </Button>
        </SheetActions>
      </form>
    </>
  );
}
