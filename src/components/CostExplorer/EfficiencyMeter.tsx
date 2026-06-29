import { formatPercent } from "@/lib/format";

/**
 * Compact utilization indicator. The fill color is interpolated between the
 * negative and positive tokens with `color-mix()` based on the value, so low
 * efficiency reads red and high efficiency reads green — without per-step
 * threshold classes.
 */
export function EfficiencyMeter({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const fill = `color-mix(in oklab, var(--positive) ${clamped}%, var(--negative))`;

  return (
    <span className="inline-flex items-center justify-end gap-2">
      <span className="tabular-nums text-ink-2">{formatPercent(clamped)}</span>
      <span
        className="relative h-1.5 w-12 overflow-hidden rounded-full bg-surface-2"
        aria-hidden="true"
      >
        <span
          className="absolute inset-y-0 start-0 rounded-full"
          style={{ inlineSize: `${clamped}%`, backgroundColor: fill }}
        />
      </span>
    </span>
  );
}
