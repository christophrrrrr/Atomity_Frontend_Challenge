"use client";

import { AnimatedNumber } from "@/components/primitives/AnimatedNumber";
import { Skeleton } from "@/components/primitives/Skeleton";
import { formatCurrency } from "@/lib/format";
import { estimateSavings } from "@/lib/savings";
import type { CostNode } from "@/lib/types";

/**
 * Optimization insight (folds in Option B's "estimated savings"): how much of
 * the current view's spend looks reclaimable, with an animated counter.
 */
export function SavingsCallout({
  nodes,
  unitLabel,
  isLoading,
}: {
  nodes: CostNode[];
  /** Plural lowercase level name, e.g. "clusters". */
  unitLabel: string;
  isLoading: boolean;
}) {
  const { savings, lowCount, total, threshold } = estimateSavings(nodes);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-panel border border-line bg-brand-soft px-5 py-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brand-strong">
          Estimated monthly savings
        </p>
        {isLoading ? (
          <Skeleton className="mt-1.5 h-8 w-28" />
        ) : (
          <p className="text-3xl font-semibold tracking-tight text-brand-strong">
            <AnimatedNumber value={savings} format={formatCurrency} />
            <span className="ms-1 text-base font-medium opacity-70">/mo</span>
          </p>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-4 w-52" />
      ) : (
        <p className="max-w-xs text-sm text-ink-2">
          {lowCount > 0 ? (
            <>
              Reclaimable idle spend across{" "}
              <span className="font-semibold text-ink">{lowCount}</span> of {total}{" "}
              {unitLabel} running below {threshold}% efficiency.
            </>
          ) : (
            <>
              All {total} {unitLabel} are above {threshold}% efficiency — little to
              reclaim.
            </>
          )}
        </p>
      )}
    </div>
  );
}
