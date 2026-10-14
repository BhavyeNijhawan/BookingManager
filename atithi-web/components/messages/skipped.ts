"use client";

import { useStore } from "@/lib/store";
import type { Scheduled } from "@/lib/selectors";

/* Skipped sends live in the main store, so Reset sample data clears them too.
   Shared by the phone list and the laptop pane so both agree. */
export const sendKey = (s: Scheduled) => `${s.ts}|${s.booking?.id ?? "caretaker"}|${s.what}`;

type SkipState = { keys: string[]; toggle: (key: string) => void };

export function useSkipped<T>(select: (s: SkipState) => T): T {
  return useStore((s) => select({ keys: s.skipped, toggle: s.toggleSkip }));
}
