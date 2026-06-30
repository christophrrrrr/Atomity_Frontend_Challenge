"use client";

import { TIME_RANGES } from "@/lib/timeRanges";
import type { TimeRange } from "@/lib/types";

/** Segmented control for the active time window. Each option is a distinct
 *  cache key, so switching and returning is instant on revisit. */
export function TimeRangeSelector({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Time range"
      className="inline-flex items-center rounded-full border border-line bg-surface p-0.5"
    >
      {TIME_RANGES.map((range) => {
        const selected = range.id === value.id;
        return (
          <button
            key={range.id}
            type="button"
            aria-pressed={selected}
            aria-label={range.label}
            onClick={() => onChange(range)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selected
                ? "bg-brand text-white"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            {range.id.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
