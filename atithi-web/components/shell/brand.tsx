import { cn } from "@/lib/cn";

/** The Atithi mark: an ink "A" on paper with the alert dot, matching the app icon. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="9" className="fill-ink" />
      <path d="M10.2 23 15 9.6h2L21.8 23h-2.5l-1.15-3.4h-4.3L12.7 23h-2.5Zm4.55-5.55h3.1L16.3 12.6l-1.55 4.85Z" className="fill-paper" />
      <circle cx="24.5" cy="23.6" r="2.1" className="fill-alert" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark />
      <span className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink">Atithi</span>
    </span>
  );
}
