import type { ReactNode } from "react";

/** The caretaker's phone view stands alone: no sidebar, no tab bar, no owner sheets. */
export default function CaretakerLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-paper">{children}</main>;
}
