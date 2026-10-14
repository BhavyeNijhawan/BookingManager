import { cloneElement, isValidElement, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const control =
  "w-full min-w-0 rounded-md border border-line-2 bg-surface px-3 text-body text-ink placeholder:text-ink-3 " +
  "transition-[border-color,box-shadow] duration-150 hover:border-ink/25 " +
  "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/15 " +
  "aria-invalid:border-alert";

/** Label, control and an optional hint or error. The label is always visible. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  const noteId = error || hint ? `${htmlFor}-note` : undefined;
  // Link the hint or error to the control so screen readers announce it with the field.
  const described =
    noteId && isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          "aria-describedby": noteId,
          "aria-invalid": error ? true : undefined,
        })
      : children;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-small font-medium text-ink">
        {label}
      </label>
      {described}
      {error ? (
        <p id={noteId} role="alert" className="text-caption text-alert-ink">
          {error}
        </p>
      ) : hint ? (
        <p id={noteId} className="text-caption text-ink-2">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cn(control, "h-11", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24 py-2.5 leading-[1.375rem]", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <span className="relative block">
      <select className={cn(control, "h-11 appearance-none pr-9", className)} {...rest}>
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-2" />
    </span>
  );
}

/** Two short fields side by side */
export function FieldRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 xs:gap-4", className)}>{children}</div>;
}
