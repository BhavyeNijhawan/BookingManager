"use client";

import { toast } from "sonner";
import { channelName } from "./selectors";
import type { Booking } from "./types";

/** The prototype cannot place calls; it says what the real app would do. */
export function callGuest(b: Booking) {
  const masked = b.guest.phone.startsWith("via");
  toast(`Calling ${b.guest.name}`, {
    description: masked ? `Through ${channelName(b)}’s masked number.` : b.guest.phone,
  });
}

export function openExtranet(name: string) {
  toast(`Opening ${name}`, { description: "The real app opens the exact booking on the platform’s extranet." });
}
