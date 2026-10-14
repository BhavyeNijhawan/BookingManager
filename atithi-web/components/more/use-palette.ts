"use client";

import { useSyncExternalStore } from "react";
import { applyPalette } from "@/lib/palette";
import type { Palette } from "@/lib/types";

/* The applied palette lives on <html data-palette>. Reading it through useSyncExternalStore keeps the
   server render ("paper") and the first client render identical, then switches to the real value
   without a hydration mismatch, and follows any later change made anywhere in the app. */

const read = (): Palette => {
  const p = document.documentElement.dataset.palette;
  return p === "monsoon" || p === "chalk" ? p : "paper";
};

const subscribe = (onChange: () => void) => {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-palette"] });
  return () => mo.disconnect();
};

export function usePalette(): [Palette, (p: Palette) => void] {
  const palette = useSyncExternalStore(subscribe, read, () => "paper" as Palette);
  return [palette, applyPalette];
}
