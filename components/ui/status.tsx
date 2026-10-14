import { cn } from "@/lib/cn";
import { STATUS } from "@/lib/selectors";
import type { Status } from "@/lib/types";
import type { SyncState } from "@/lib/selectors";

export type Mark = Status | "block";

/** The fill and line style of a stay-chart bar, reused by the status glyph and the legend so the system reads as one. */
export const barStyle: Record<Mark, string> = {
  in_house: "bg-ink text-paper",
  confirmed: "bg-[color-mix(in_srgb,var(--ink)_13%,var(--surface))] text-ink",
  unverified: "border border-dashed border-alert bg-[color-mix(in_srgb,var(--alert)_6%,var(--surface))] text-alert-ink",
  verified: "border border-dashed border-alert bg-[color-mix(in_srgb,var(--alert)_13%,var(--surface))] text-alert-ink",
  flagged: "border border-alert bg-[color-mix(in_srgb,var(--alert)_22%,var(--surface))] text-alert-ink",
  checked_out: "bg-[color-mix(in_srgb,var(--ink)_6%,var(--surface))] text-ink-3",
  cancelled: "border border-line-2 bg-surface text-ink-3",
  block: "border border-line-2 bg-surface bg-hatch text-ink-2",
};

/** A 14x8 glyph shaped like the stay-chart bar for this status */
export function StatusGlyph({ mark, className }: { mark: Mark; className?: string }) {
  const style =
    mark === "confirmed"
      ? "bg-ink/30"
      : mark === "checked_out"
        ? "bg-ink/12"
        : barStyle[mark].replace(/text-\S+/g, "");
  return <span aria-hidden className={cn("inline-block h-2 w-3.5 shrink-0 rounded-[3px]", style, className)} />;
}

/** Status in words with its glyph. Alert colour only for statuses that need the owner. */
export function StatusMark({ status, long, className }: { status: Status; long?: boolean; className?: string }) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-small",
        s.attention ? "text-alert-ink" : s.past ? "text-ink-3" : "text-ink-2",
        s.strong && "font-medium",
        className,
      )}
    >
      <StatusGlyph mark={status} />
      {long ? s.label : s.short}
    </span>
  );
}

const sealCell: Record<SyncState, string> = {
  source: "bg-ink",
  blocked: "bg-ink",
  updating: "border border-dashed border-accent",
  open: "border border-line-2",
};

/** Four small squares, one per platform, and the count in words. */
export function SyncSeal({ states, className, showText = true }: { states: SyncState[]; className?: string; showText?: boolean }) {
  const closed = states.filter((s) => s === "source" || s === "blocked").length;
  const updating = states.some((s) => s === "updating");
  return (
    <span className={cn("inline-flex items-center gap-2 text-small text-ink-2", className)}>
      <span aria-hidden className="inline-flex gap-[3px]">
        {states.map((s, i) => (
          <span key={i} className={cn("size-[7px] rounded-[2px]", sealCell[s])} />
        ))}
      </span>
      {showText && (
        <span className="tabular">
          {closed} of {states.length} closed{updating ? ", updating" : ""}
        </span>
      )}
    </span>
  );
}
