import type { Metadata } from "next";
import { BrandMark } from "@/components/shell/brand";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center bg-paper px-4 py-16 lg:px-10">
      <div className="mx-auto w-full max-w-md">
        <BrandMark className="size-10" />
        <p className="mt-8 text-small text-ink-2">Page not found</p>
        <h1 className="mt-1 text-[1.5rem] leading-[1.875rem] font-medium tracking-[-0.022em] text-ink lg:text-display">
          This page isn’t part of Atithi
        </h1>
        <p className="mt-3 text-body text-ink-2">
          The link may be old or mistyped. Everything in this prototype starts from Today.
        </p>
        <ButtonLink href="/" variant="primary" className="mt-8">
          Back to Today
        </ButtonLink>
      </div>
    </main>
  );
}
