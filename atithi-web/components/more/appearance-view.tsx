"use client";

import { useRef, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { PALETTES } from "@/lib/palette";
import type { Palette } from "@/lib/types";
import { PageBody, PageHeader } from "@/components/shell/page-header";
import { ButtonLink } from "@/components/ui/button";
import { List, SectionHeader, Surface } from "@/components/ui/surface";
import { usePalette } from "./use-palette";

type PaletteDef = (typeof PALETTES)[number];

/* The two values each palette derives in globals.css, written out so the previews can render
   every palette at once, whatever palette the page itself is in. */
const DERIVED: Record<Palette, { surface: string; alertInk: string }> = {
  paper: { surface: "#fffefb", alertInk: "#9c4329" },
  monsoon: { surface: "#fbfcfa", alertInk: "#983b22" },
  chalk: { surface: "#ffffff", alertInk: "#a63621" },
};

const mix = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

/** A miniature Today screen drawn in one palette's literal colours. */
function Preview({ p }: { p: PaletteDef }) {
  const { paper, ink, accent, alert } = p.colors;
  const { surface, alertInk } = DERIVED[p.id];
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-lg border p-3.5 select-none"
      style={{ background: paper, color: ink, borderColor: mix(ink, 9) }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] leading-3" style={{ color: mix(ink, 66) }}>
          Sunday, 11 October
        </span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: alert }} />
      </div>
      <p className="mt-1 text-[14px] leading-5 font-medium tracking-[-0.01em]">2 bookings need you</p>

      <div className="mt-2.5 rounded-[9px] border p-2.5" style={{ background: surface, borderColor: mix(alert, 38) }}>
        <div className="flex items-center gap-2">
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-medium"
            style={{ background: mix(ink, 9), color: mix(ink, 66) }}
          >
            PS
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11px] leading-4 font-medium">Priya Sharma</span>
            <span className="flex items-center gap-1 text-[10px] leading-3" style={{ color: alertInk }}>
              <span
                className="inline-block h-[6px] w-[11px] rounded-[2px] border border-dashed"
                style={{ borderColor: alert, background: mix(alert, 13) }}
              />
              Advance pending
            </span>
          </span>
          <span className="text-[11px] font-medium">₹9,800</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="rounded-[6px] px-2 py-1 text-[10px] leading-3 font-medium text-white" style={{ background: accent }}>
            Resend payment link
          </span>
          <span className="rounded-[6px] border px-2 py-1 text-[10px] leading-3" style={{ borderColor: mix(ink, 16), background: surface }}>
            Call
          </span>
        </div>
      </div>

      <div className="mt-2.5 flex h-2 gap-[3px]">
        <span className="w-[22%] rounded-[3px]" style={{ background: ink }} />
        <span className="w-[30%] rounded-[3px]" style={{ background: `color-mix(in srgb, ${ink} 13%, ${surface})` }} />
        <span className="w-[18%] rounded-[3px] border border-dashed" style={{ borderColor: alert, background: mix(alert, 6) }} />
        <span className="flex-1" />
      </div>
    </div>
  );
}

const USES: { key: keyof PaletteDef["colors"]; name: string; use: string; swatch: string }[] = [
  { key: "paper", name: "Paper", use: "The page behind everything", swatch: "bg-paper border border-line-2" },
  { key: "ink", name: "Ink", use: "Text, staying-now bars, the active tab. Greys are the ink, lighter.", swatch: "bg-ink" },
  { key: "accent", name: "Accent", use: "Actions only: buttons, links, the now line", swatch: "bg-accent" },
  { key: "alert", name: "Alert", use: "Only for things that need you", swatch: "bg-alert" },
];

export function AppearanceView() {
  const [palette, apply] = usePalette();
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const current = PALETTES.find((p) => p.id === palette) ?? PALETTES[0];

  const choose = (id: Palette) => {
    if (id === palette) return;
    apply(id);
    const p = PALETTES.find((x) => x.id === id);
    toast(`${p?.name ?? "New"} palette on`, { description: "Every screen uses it now. It is saved on this device." });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = PALETTES.findIndex((p) => p.id === palette);
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % PALETTES.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + PALETTES.length) % PALETTES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = PALETTES.length - 1;
    if (next < 0) return;
    e.preventDefault();
    choose(PALETTES[next].id);
    refs.current[next]?.focus();
  };

  return (
    <>
      <PageHeader
        back={{ href: "/more", label: "More" }}
        kicker="Colours"
        title="Appearance"
        description="Paper is the palette you picked. The others are here so you can compare them on the real screens."
      />
      <PageBody>
        <section aria-labelledby="pal-h">
          <SectionHeader id="pal-h" title="Palette" />
          <div role="radiogroup" aria-labelledby="pal-h" onKeyDown={onKeyDown} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {PALETTES.map((p, i) => {
              const selected = p.id === palette;
              return (
                <div
                  key={p.id}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${p.name}. ${p.description}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => choose(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      choose(p.id);
                    }
                  }}
                  className={cn(
                    "cursor-pointer rounded-xl border bg-surface p-3 transition-[border-color,background-color] duration-150",
                    selected ? "border-accent shadow-[0_0_0_1px_var(--accent)]" : "border-line hover:border-line-2",
                  )}
                >
                  <Preview p={p} />
                  <div className="flex items-start gap-3 px-1 pt-3.5 pb-1">
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-[border-color] duration-150",
                        selected ? "border-accent" : "border-line-2",
                      )}
                    >
                      <span className={cn("size-2 rounded-full bg-accent transition-[opacity,transform] duration-150", selected ? "scale-100 opacity-100" : "scale-50 opacity-0")} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-medium text-ink">{p.name}</span>
                        <span aria-hidden className="flex gap-1">
                          {(["paper", "ink", "accent", "alert"] as const).map((k) => (
                            <span
                              key={k}
                              className="size-3 rounded-full border"
                              style={{ background: p.colors[k], borderColor: mix(p.colors.ink, 16) }}
                            />
                          ))}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-small text-ink-2">{p.description}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 px-1">
            <p className="text-small text-ink-2">Saved on this device. See it on:</p>
            <div className="flex gap-2">
              <ButtonLink href="/" size="sm" variant="secondary">
                Today
              </ButtonLink>
              <ButtonLink href="/calendar" size="sm" variant="secondary">
                Calendar
              </ButtonLink>
              <ButtonLink href="/bookings" size="sm" variant="secondary">
                Bookings
              </ButtonLink>
            </div>
          </div>
        </section>

        <section aria-labelledby="uses-h" className="mt-10 lg:max-w-[calc((100%-2rem)*2/3+1rem)]">
          <SectionHeader id="uses-h" title={`Four colours in ${current.name}`} />
          <Surface>
            <List>
              {USES.map((u) => (
                <div key={u.key} className="flex items-center gap-3 px-4 py-3">
                  <span aria-hidden className={cn("size-7 shrink-0 rounded-md", u.swatch)} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{u.name}</p>
                    <p className="text-small text-ink-2">{u.use}</p>
                  </div>
                  <span className="tabular shrink-0 text-small text-ink-3">{current.colors[u.key].toUpperCase()}</span>
                </div>
              ))}
            </List>
          </Surface>
          <p className="mt-3 px-1 text-caption text-ink-2">
            Status is always written in words. Colour only adds emphasis, so every palette reads the same.
          </p>
        </section>
      </PageBody>
    </>
  );
}
