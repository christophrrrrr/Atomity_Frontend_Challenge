/**
 * Period-over-period change indicator. Rising spend is bad (negative color),
 * falling spend is good (positive color). `value` is a signed fraction, e.g.
 * 0.12 → "▲ 12%".
 */
export function TrendBadge({ value }: { value: number }) {
  const pct = Math.round(Math.abs(value) * 100);
  if (pct < 1) {
    return <span className="text-xs text-ink-3">—</span>;
  }
  const up = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${
        up ? "text-negative" : "text-positive"
      }`}
      title={`${up ? "Up" : "Down"} ${pct}% vs previous period`}
    >
      <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
        <path
          d={up ? "M6 2l4 6H2z" : "M6 10 2 4h8z"}
          fill="currentColor"
        />
      </svg>
      {pct}%
    </span>
  );
}
