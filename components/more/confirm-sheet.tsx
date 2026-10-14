"use client";

import { Button } from "@/components/ui/button";
import { SheetActions, SheetClose, SheetFrame, SheetHeader } from "@/components/ui/sheet";

/**
 * A small confirmation for destructive prototype actions (reset, revoke).
 * It renders its own sheet frame because the global sheet host has no generic confirm kind.
 */
export function ConfirmSheet({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  return (
    <SheetFrame open={open} onOpenChange={onOpenChange}>
      <SheetHeader title={title} description={description} />
      <SheetActions className="mt-2">
        <SheetClose asChild>
          <Button variant="secondary">{cancelLabel}</Button>
        </SheetClose>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmLabel}
        </Button>
      </SheetActions>
    </SheetFrame>
  );
}
