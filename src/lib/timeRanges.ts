import type { TimeRange } from "./types";

/** Selectable windows. The multiplier scales cost magnitudes per range, so
 *  switching range yields genuinely different data (and a new cache key). */
export const TIME_RANGES: readonly TimeRange[] = [
  { id: "7d", label: "Last 7 days", multiplier: 0.25 },
  { id: "30d", label: "Last 30 days", multiplier: 1 },
  { id: "90d", label: "Last 90 days", multiplier: 3 },
];

export const DEFAULT_TIME_RANGE: TimeRange = TIME_RANGES[1];
