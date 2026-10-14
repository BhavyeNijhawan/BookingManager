"use client";

import type { ReactNode } from "react";
import { CalendarOff, ChevronRight, UserPlus } from "lucide-react";
import { TODAY } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { addDays } from "@/lib/format";
import { SheetHeader } from "@/components/ui/sheet";

/** The two things the owner adds by hand: a booking that came by phone, or nights to close. */
export function AddSheet() {
  const openSheet = useStore((s) => s.openSheet);
  return (
    <>
      <SheetHeader title="Add to the calendar" description="Whatever you add here closes the nights on every platform." />
      <div className="flex flex-col gap-3">
        <Choice
          icon={<UserPlus aria-hidden />}
          title="Direct booking"
          text="From a WhatsApp or phone enquiry. Gets the same confirmation and advance link."
          onClick={() => openSheet({ kind: "direct", date: addDays(TODAY, 7) })}
        />
        <Choice
          icon={<CalendarOff aria-hidden />}
          title="Block dates"
          text="Your own stay, repairs or a deep clean."
          onClick={() => openSheet({ kind: "block" })}
        />
      </div>
    </>
  );
}

function Choice({ icon, title, text, onClick }: { icon: ReactNode; title: string; text: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-start gap-4 rounded-lg border border-line-2 bg-surface p-4 text-left transition-[background-color,border-color] duration-150 hover:border-ink/25 hover:bg-fill"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-fill text-ink-2 [&_svg]:size-5 [&_svg]:stroke-[1.75]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ink">{title}</span>
        <span className="mt-0.5 block text-small text-ink-2">{text}</span>
      </span>
      <ChevronRight aria-hidden className="mt-2.5 size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
