"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useStore, type SheetState } from "@/lib/store";
import { SheetFrame } from "@/components/ui/sheet";
import { DaySheet } from "@/components/calendar/day-sheet";
import { AddSheet } from "@/components/bookings/add-sheet";
import { DirectForm } from "@/components/bookings/direct-form";
import { BlockForm } from "@/components/bookings/block-form";
import { BlockInfoSheet } from "@/components/bookings/block-info-sheet";
import { CancelSheet } from "./cancel-sheet";
import { DemoSheet } from "@/components/demo/demo-sheet";
import { IntroSheet } from "@/components/demo/intro-sheet";

function Content({ sheet }: { sheet: SheetState }) {
  switch (sheet.kind) {
    case "day":
      return <DaySheet date={sheet.date} />;
    case "add":
      return <AddSheet />;
    case "direct":
      return <DirectForm date={sheet.date} unit={sheet.unit} />;
    case "block":
      return <BlockForm date={sheet.date} unit={sheet.unit} />;
    case "block-info":
      return <BlockInfoSheet id={sheet.id} />;
    case "cancel":
      return <CancelSheet id={sheet.id} />;
    case "demo":
      return <DemoSheet />;
    case "intro":
      return <IntroSheet />;
  }
}

/** The one place sheets render. Pages open a sheet with `useStore.getState().openSheet({...})`. */
export function SheetHost() {
  const sheet = useStore((s) => s.sheet);
  const open = useStore((s) => s.sheetOpen);
  const closeSheet = useStore((s) => s.closeSheet);
  const pathname = usePathname();

  // Close on navigation so a sheet never follows the user to another screen.
  // Only on a real change of route: not on mount, so a sheet opened on first load stays open.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    useStore.getState().closeSheet();
  }, [pathname]);

  const wide = sheet?.kind === "demo" || sheet?.kind === "intro";
  return (
    <SheetFrame open={open} onOpenChange={(o) => !o && closeSheet()} wide={wide}>
      {sheet && <Content sheet={sheet} />}
    </SheetFrame>
  );
}
