"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TODAY, UNITS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { addDays, fmtDow, inr, nightsWord } from "@/lib/format";
import { unitName } from "@/lib/selectors";
import type { UnitId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { SheetActions, SheetClose, SheetHeader } from "@/components/ui/sheet";
import { clashFor, freeUnit, maxGuests } from "./availability";
import { Availability, FormError, Pair, toInt } from "./form-bits";

/** Sample direct rates per night, used until the owner types a total */
const RATE: Record<UnitId, number> = { villa: 15000, cottage: 5500 };
const round100 = (n: number) => Math.round(n / 100) * 100;
const grouped = (n: number) => new Intl.NumberFormat("en-IN").format(n);

type Key = "name" | "pax" | "ci" | "n" | "total" | "advance";
const ORDER: Key[] = ["name", "pax", "ci", "n", "total", "advance"];

/** A booking that came by phone or WhatsApp. It gets the same verification as a platform booking. */
export function DirectForm({ date, unit }: { date?: string; unit?: UnitId }) {
  const router = useRouter();
  const bookings = useStore((s) => s.bookings);
  const blocks = useStore((s) => s.blocks);
  const addDirect = useStore((s) => s.addDirect);

  const [start] = useState(() => {
    const st = useStore.getState();
    const ci = date && date >= TODAY ? date : addDays(TODAY, 7);
    return { ci, unit: unit ?? freeUnit(st.bookings, st.blocks, ci, 1) ?? UNITS[0].id };
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pax, setPax] = useState("2");
  const [unitId, setUnitId] = useState<UnitId>(start.unit);
  const [ci, setCi] = useState(start.ci);
  const [n, setN] = useState("1");
  const [total, setTotal] = useState<string | null>(null); // null follows the usual rate
  const [advance, setAdvance] = useState<string | null>(null); // null follows 30% of the total
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [failed, setFailed] = useState<string | null>(null);

  const nights = toInt(n);
  const autoTotal = RATE[unitId] * (nights > 0 ? nights : 1);
  const totalNum = total === null ? autoTotal : toInt(total);
  const autoAdvance = totalNum > 0 ? round100(totalNum * 0.3) : 0;
  const advNum = advance === null ? autoAdvance : toInt(advance);
  const datesOk = !!ci && ci >= TODAY && nights >= 1 && nights <= 30;
  const clash = datesOk ? clashFor(bookings, blocks, unitId, ci, nights) : null;
  const co = datesOk ? addDays(ci, nights) : null;

  /** Any edit clears that field's error and the last refusal */
  const edit = (key: Key | null, fn: () => void) => {
    fn();
    setFailed(null);
    if (key && errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function validate() {
    const e: Partial<Record<Key, string>> = {};
    if (!name.trim()) e.name = "Enter the guest’s name.";
    const p = toInt(pax);
    const max = maxGuests(unitId);
    if (!(p >= 1)) e.pax = "At least 1 guest.";
    else if (p > max) e.pax = `${unitName(unitId)} sleeps ${max}.`;
    if (!ci) e.ci = "Pick a date.";
    else if (ci < TODAY) e.ci = "From today on.";
    if (!(nights >= 1)) e.n = "At least 1 night.";
    else if (nights > 30) e.n = "30 nights at most.";
    if (!(totalNum > 0)) e.total = "Enter the total.";
    if (!(advNum >= 0)) e.advance = "Enter an amount, or 0.";
    else if (advNum > totalNum) e.advance = "More than the total.";
    return e;
  }

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    const first = ORDER.find((k) => e[k]);
    if (first) {
      document.getElementById(`df-${first}`)?.focus();
      return;
    }
    const res = addDirect({ name: name.trim(), phone: phone.trim(), pax: toInt(pax), unit: unitId, ci, nights, amount: totalNum, advance: advNum });
    if (!res.ok) {
      setFailed(res.reason);
      return;
    }
    router.push(`/bookings/${res.id}`);
  }

  return (
    <>
      <SheetHeader
        title="Direct booking"
        description="Adds the booking, closes the nights on all four platforms and asks the guest to confirm on WhatsApp with an advance link."
      />
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Guest name" htmlFor="df-name" error={errors.name}>
          <Input
            id="df-name"
            name="name"
            autoComplete="name"
            autoCapitalize="words"
            placeholder="Full name…"
            value={name}
            aria-invalid={!!errors.name || undefined}
            onChange={(e) => edit("name", () => setName(e.target.value))}
            onBlur={() => name.length > 0 && !name.trim() && setErrors((e) => ({ ...e, name: "Enter the guest’s name." }))}
          />
        </Field>
        <Field label="WhatsApp number" htmlFor="df-phone" hint="The confirmation and the payment link go to this number.">
          <Input
            id="df-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210…"
            value={phone}
            onChange={(e) => edit(null, () => setPhone(e.target.value))}
          />
        </Field>
        <Pair>
          <Field label="Unit" htmlFor="df-unit">
            <Select id="df-unit" name="unit" value={unitId} onChange={(e) => edit("pax", () => setUnitId(e.target.value as UnitId))}>
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Guests" htmlFor="df-pax" error={errors.pax} hint={`Up to ${maxGuests(unitId)}`}>
            <Input
              id="df-pax"
              name="guests"
              inputMode="numeric"
              autoComplete="off"
              value={pax}
              aria-invalid={!!errors.pax || undefined}
              onChange={(e) => edit("pax", () => setPax(e.target.value))}
            />
          </Field>
        </Pair>
        <Pair>
          <Field label="Check-in" htmlFor="df-ci" error={errors.ci}>
            <Input
              id="df-ci"
              name="checkin"
              type="date"
              min={TODAY}
              value={ci}
              aria-invalid={!!errors.ci || undefined}
              onChange={(e) => edit("ci", () => setCi(e.target.value))}
            />
          </Field>
          <Field label="Nights" htmlFor="df-n" error={errors.n}>
            <Input
              id="df-n"
              name="nights"
              inputMode="numeric"
              autoComplete="off"
              value={n}
              aria-invalid={!!errors.n || undefined}
              onChange={(e) => edit("n", () => setN(e.target.value))}
            />
          </Field>
        </Pair>
        {co && !failed && <Availability clash={clash} free={`${fmtDow(ci)} to ${fmtDow(co)} is open on every platform.`} />}
        <Pair>
          <Field
            label="Total"
            htmlFor="df-total"
            error={errors.total}
            hint={total === null && nights >= 1 ? `${nightsWord(nights)} at ${inr(RATE[unitId])}` : undefined}
          >
            <Rupees
              id="df-total"
              name="total"
              value={total ?? grouped(autoTotal)}
              invalid={!!errors.total}
              onChange={(v) => edit("total", () => setTotal(v))}
            />
          </Field>
          <Field
            label="Advance to ask"
            htmlFor="df-advance"
            error={errors.advance}
            hint={totalNum > 0 && advNum >= 0 && advNum <= totalNum ? `${inr(totalNum - advNum)} left for check-in` : undefined}
          >
            <Rupees
              id="df-advance"
              name="advance"
              value={advance ?? grouped(autoAdvance)}
              invalid={!!errors.advance}
              onChange={(v) => edit("advance", () => setAdvance(v))}
            />
          </Field>
        </Pair>
        {failed && <FormError>{failed}</FormError>}
        <SheetActions className="mt-2">
          <SheetClose asChild>
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <Button type="submit" variant="primary">
            Add and send WhatsApp
          </Button>
        </SheetActions>
      </form>
    </>
  );
}

function Rupees({ id, name, value, invalid, onChange }: { id: string; name: string; value: string; invalid: boolean; onChange: (v: string) => void }) {
  return (
    <span className="relative block">
      <span aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-body text-ink-2">
        ₹
      </span>
      <Input
        id={id}
        name={name}
        inputMode="numeric"
        autoComplete="off"
        className="tabular pl-7"
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </span>
  );
}
