"use client";

import { Card } from "@/components/primitives/Card";
import { useCostData } from "@/hooks/useCostData";
import { useNodeSort } from "@/hooks/useNodeSort";
import { LEVEL_SINGULAR } from "@/lib/levels";
import { DEFAULT_TIME_RANGE } from "@/lib/timeRanges";
import type { Level } from "@/lib/types";
import { CostTable } from "./CostTable";

/**
 * Cost explorer section. Loads the cluster level and renders a sortable metrics
 * table with loading / error / success states; the bar chart, drill-down, and
 * toolbar are layered on in later steps.
 */
export function CostExplorerSection() {
  const range = DEFAULT_TIME_RANGE;
  const level: Level = "cluster";
  const { data, isPending, isError, error, refetch } = useCostData(
    level,
    null,
    range,
  );
  const { sorted, sort, toggleSort } = useNodeSort(data);

  return (
    <section
      aria-labelledby="cost-explorer-heading"
      className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-24"
    >
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand">
          {range.label}
        </p>
        <h2
          id="cost-explorer-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
        >
          Cluster cost breakdown
        </h2>
        <p className="mt-2 max-w-prose text-ink-2">
          Spend across every cluster, derived live from the API. Sort any column
          to compare.
        </p>
      </header>

      {isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : (
        <Card className="overflow-hidden">
          <CostTable
            nodes={sorted}
            isLoading={isPending}
            entityLabel={LEVEL_SINGULAR[level]}
            sort={sort}
            onSort={toggleSort}
          />
        </Card>
      )}
    </section>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-panel border border-negative/40 bg-surface px-5 py-6"
    >
      <p className="font-medium text-ink">Couldn&apos;t load cost data.</p>
      {message ? <p className="text-sm text-ink-2">{message}</p> : null}
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
      >
        Try again
      </button>
    </div>
  );
}
