"use client";

import type { Palette } from "./types";

export const PALETTES: { id: Palette; name: string; description: string; colors: { paper: string; ink: string; accent: string; alert: string } }[] = [
  { id: "paper", name: "Paper", description: "Warm paper, ink and a deep blue. The one you picked.", colors: { paper: "#f8f6f1", ink: "#1e1d1a", accent: "#2e4a6b", alert: "#b4573c" } },
  { id: "monsoon", name: "Monsoon", description: "Misty green paper and a moss accent, like Lonavala in July.", colors: { paper: "#f1f4f1", ink: "#17201c", accent: "#2b5a47", alert: "#b04a2f" } },
  { id: "chalk", name: "Chalk", description: "Neutral white with an indigo accent. The most businesslike.", colors: { paper: "#f5f5f4", ink: "#1a1a1d", accent: "#3a46a8", alert: "#c2452d" } },
];

const KEY = "atithi-palette";

export function readPalette(): Palette {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "paper" || v === "monsoon" || v === "chalk") return v;
  } catch {}
  return "paper";
}

export function applyPalette(p: Palette) {
  document.documentElement.dataset.palette = p;
  const meta = document.querySelector('meta[name="theme-color"]');
  const paper = PALETTES.find((x) => x.id === p)?.colors.paper;
  if (meta && paper) meta.setAttribute("content", paper);
  try {
    localStorage.setItem(KEY, p);
  } catch {}
}

/** Runs before first paint (inlined in the root layout) so the chosen palette never flashes. */
export const PALETTE_BOOT = `(function(){try{var p=localStorage.getItem('${KEY}');if(p==='monsoon'||p==='chalk'){document.documentElement.dataset.palette=p;}}catch(e){}})();`;
