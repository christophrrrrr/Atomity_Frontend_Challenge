"use client";

import { RESOURCES } from "@/lib/resources";
import type { BarMetric } from "@/lib/types";

const OPTIONS: { key: BarMetric; label: string }[] = [
  { key: "total", label: "Total" },
  ...RESOURCES.map((r) => ({ key: r.key as BarMetric, label: r.label })),
];

/**
 * Chooses which metric the bars represent. Built from real radio inputs (native
 * radiogroup semantics + arrow-key navigation), with the selected/focused chip
 * styled purely in CSS via `:has()` — no selected-class bookkeeping in JS.
 */
export function ResourceFilter({
  value,
  onChange,
}: {
  value: BarMetric;
  onChange: (metric: BarMetric) => void;
}) {
  return (
    <fieldset>
      <legend className="sr-only">Size bars by</legend>
      <div className="flex flex-wrap gap-1.5">
        {OPTIONS.map((option) => (
          <label
            key={option.key}
            className="cursor-pointer rounded-full border border-line px-3 py-1 text-sm font-medium text-ink-2 transition-colors hover:text-ink has-[:checked]:border-transparent has-[:checked]:bg-brand-soft has-[:checked]:text-brand-strong has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"
          >
            <input
              type="radio"
              name="bar-metric"
              className="sr-only"
              checked={value === option.key}
              onChange={() => onChange(option.key)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
