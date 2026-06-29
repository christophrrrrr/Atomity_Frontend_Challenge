"use client";

import { Skeleton } from "@/components/primitives/Skeleton";
import { useCostData } from "@/hooks/useCostData";
import { formatCurrency, formatPercent } from "@/lib/format";
import { DEFAULT_TIME_RANGE } from "@/lib/timeRanges";

/**
 * Cost explorer section. At this stage it loads the cluster level and renders
 * loading / error / success states; the bar chart, table, drill-down, and
 * toolbar are layered on in later steps.
 */
export function CostExplorerSection() {
  const range = DEFAULT_TIME_RANGE;
  const { data, isPending, isError, error, refetch, isFetching } = useCostData(
    "cluster",
    null,
    range,
  );

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
          Spend across every cluster, derived live from the API.
        </p>
      </header>

      {isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : isPending ? (
        <LoadingState />
      ) : (
        <ul className="flex flex-col gap-2" aria-busy={isFetching}>
          {data.map((node) => (
            <li
              key={node.id}
              className="flex items-center justify-between rounded-card border border-line bg-surface px-4 py-3 shadow-card"
            >
              <span className="font-medium text-ink">{node.name}</span>
              <span className="flex items-center gap-5">
                <span className="text-sm text-ink-2 tabular-nums">
                  {formatPercent(node.metrics.efficiency)} efficient
                </span>
                <span className="font-semibold tabular-nums text-ink">
                  {formatCurrency(node.metrics.total)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[50px] w-full rounded-card" />
      ))}
    </div>
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
      className="flex flex-col items-start gap-3 rounded-card border border-negative/40 bg-surface px-5 py-6"
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
