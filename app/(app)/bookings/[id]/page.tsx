import type { Metadata } from "next";
import { Suspense } from "react";
import { SEED_BOOKINGS } from "@/lib/seed";
import { BookingDetail, BookingSkeleton } from "@/components/bookings/booking-detail";

export function generateStaticParams() {
  return SEED_BOOKINGS.map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: PageProps<"/bookings/[id]">): Promise<Metadata> {
  const { id } = await params;
  const b = SEED_BOOKINGS.find((x) => x.id === id);
  return { title: b ? b.guest.name : "Booking" };
}

/* The id is URL data, so it is read behind Suspense and the shared shell stays instant. */
export default function BookingPage({ params }: PageProps<"/bookings/[id]">) {
  return (
    <Suspense fallback={<BookingSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: Pick<PageProps<"/bookings/[id]">, "params">) {
  const { id } = await params;
  return <BookingDetail id={id} />;
}
