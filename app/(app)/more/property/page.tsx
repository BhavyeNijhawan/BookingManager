import type { Metadata } from "next";
import { PropertyView } from "@/components/more/property-view";

export const metadata: Metadata = { title: "Property and people" };

export default function PropertyPage() {
  return <PropertyView />;
}
