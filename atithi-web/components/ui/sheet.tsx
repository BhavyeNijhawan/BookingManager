"use client";

import type { ReactNode } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/** Bottom sheet on phones, centred dialog from 1024px. Focus is trapped and returned by Radix. */
export function SheetFrame({
  open,
  onOpenChange,
  children,
  wide,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="anim-scrim fixed inset-0 z-40 bg-ink/30 lg:bg-ink/25" />
        <Dialog.Content
          aria-describedby={undefined}
          // Focus the dialog itself on open, not the close button, so nothing looks pre-selected.
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement | null)?.focus();
          }}
          className={cn(
            "anim-sheet fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-2xl bg-surface shadow-float outline-none",
            "lg:inset-x-auto lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:max-h-[86dvh] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:border lg:border-line",
            wide ? "lg:w-[min(640px,calc(100vw-64px))]" : "lg:w-[min(520px,calc(100vw-64px))]",
          )}
        >
          <div aria-hidden className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-line-2 lg:hidden" />
          <Dialog.Close
            aria-label="Close"
            className="absolute top-3 right-3 hidden size-9 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-fill hover:text-ink lg:inline-flex"
          >
            <X aria-hidden className="size-[18px]" />
          </Dialog.Close>
          <div className="overflow-y-auto overscroll-contain px-5 pt-4 pb-[calc(20px+env(safe-area-inset-bottom,0px))] lg:px-7 lg:pt-7 lg:pb-7">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Title and one lead sentence. The title is the dialog's accessible name. */
export function SheetHeader({ title, description, kicker }: { title: ReactNode; description?: ReactNode; kicker?: ReactNode }) {
  return (
    <div className="mb-5 pr-8">
      {kicker && <p className="mb-1 text-small text-ink-2">{kicker}</p>}
      <Dialog.Title className="text-heading font-medium text-ink lg:text-[1.1875rem] lg:leading-7">{title}</Dialog.Title>
      {description && <p className="mt-1.5 text-small text-ink-2">{description}</p>}
    </div>
  );
}

/** Buttons at the bottom of a sheet. Full width on phones, right-aligned on laptops. */
export function SheetActions({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mt-6 flex flex-col-reverse gap-2 lg:flex-row lg:justify-end [&>*]:w-full lg:[&>*]:w-auto", className)}>
      {children}
    </div>
  );
}

export const SheetClose = Dialog.Close;
