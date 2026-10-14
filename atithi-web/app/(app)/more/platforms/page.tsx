import type { Metadata } from "next";
import { PlatformsView } from "@/components/more/platforms-view";

export const metadata: Metadata = { title: "Platforms and sync" };

export default function PlatformsPage() {
  return <PlatformsView />;
}
