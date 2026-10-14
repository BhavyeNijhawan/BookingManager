import type { Metadata } from "next";
import { Suspense } from "react";
import { TODAY, UNITS } from "@/lib/seed";
import { CalendarFromUrl, CalendarView } from "@/components/calendar/calendar-view";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarView month={TODAY.slice(0, 7)} unit={UNITS[0].id} />}>
      <CalendarFromUrl />
    </Suspense>
  );
}
