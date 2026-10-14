import type { Metadata } from "next";
import { CaretakerView } from "@/components/caretaker/caretaker-view";

export const metadata: Metadata = { title: "Ramesh bhai’s view" };

export default function CaretakerPage() {
  return <CaretakerView />;
}
