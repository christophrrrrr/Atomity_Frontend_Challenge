/** Display formatters — kept in one place so number styling stays consistent. */

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** "$2,463" */
export function formatCurrency(value: number): string {
  return usd.format(value);
}

/** "$2.5K" — for tight spaces like axis labels. */
export function formatCompactCurrency(value: number): string {
  return usdCompact.format(value);
}

/** "43%" */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
