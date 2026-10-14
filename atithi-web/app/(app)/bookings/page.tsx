import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingsFromUrl, BookingsView } from "@/components/bookings/bookings-view";

export const metadata: Metadata = { title: "Bookings" };

export default function BookingsPage() {
  return (
    <Suspense fallback={<BookingsView view={null} platform={null} q="" />}>
      <BookingsFromUrl />
    </Suspense>
  );
}
