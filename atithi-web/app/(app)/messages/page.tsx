import type { Metadata } from "next";
import { Suspense } from "react";
import { MessagesHome, MessagesHomeFallback } from "@/components/messages/messages-home";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesHomeFallback />}>
      <MessagesHome />
    </Suspense>
  );
}
