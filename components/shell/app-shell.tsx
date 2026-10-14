"use client";

import { useEffect, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { SheetHost } from "@/components/sheets/sheet-host";
import { Sidebar } from "./sidebar";
import { TabBar } from "./tab-bar";

const INTRO_KEY = "atithi-intro-seen";

export function AppShell({ children }: { children: ReactNode }) {
  // First visit: explain the prototype once.
  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(INTRO_KEY) === "1";
    } catch {}
    if (seen) return;
    useStore.getState().openSheet({ kind: "intro" });
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {}
  }, []);

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="fixed top-2 left-2 z-[60] -translate-y-20 rounded-md bg-ink px-3 py-2 text-small text-paper transition-transform focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="min-w-0 flex-1">
        <main id="main" className="mx-auto w-full max-w-[1260px] pb-[calc(96px+env(safe-area-inset-bottom,0px))] lg:pb-16">
          {children}
        </main>
      </div>
      <TabBar />
      <SheetHost />
    </div>
  );
}
