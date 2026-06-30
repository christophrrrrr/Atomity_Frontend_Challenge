"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/primitives/Card";
import { useCostData } from "@/hooks/useCostData";
import { useDrillPath } from "@/hooks/useDrillPath";
import { useNodeSort } from "@/hooks/useNodeSort";
import { childLevel, LEVEL_PLURAL, LEVEL_SINGULAR } from "@/lib/levels";
import { DEFAULT_TIME_RANGE } from "@/lib/timeRanges";
import type { BarMetric, CostNode, TimeRange } from "@/lib/types";
import { Breadcrumb, type Crumb } from "./Breadcrumb";
import { CostBarChart } from "./CostBarChart";
import { CostTable } from "./CostTable";
import { ResourceFilter } from "./ResourceFilter";
import { SavingsCallout } from "./SavingsCallout";
import { TimeRangeSelector } from "./TimeRangeSelector";

/**
 * Cost explorer section. Loads the current drill view (level + parent + time
 * range), and renders a bar chart and sortable table with linked hover,
 * loading / error / success states, and an animated transition between drill
 * levels. Drilling back up — and revisiting a time range — is served instantly
 * from the TanStack Query cache.
 */
export function CostExplorerSection() {
  const [range, setRange] = useState<TimeRange>(DEFAULT_TIME_RANGE);
  const [barMetric, setBarMetric] = useState<BarMetric>("total");
  const { path, level, parent, drillInto, goToDepth, rescaleForRange } =
    useDrillPath();
  const { data, isPending, isError, error, refetch } = useCostData(
    level,
    parent,
    range,
  );
  const { sorted, sort, toggleSort } = useNodeSort(data);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();

  const canDrill = childLevel(level) !== null;

  const crumbs: Crumb[] = [
    { key: "root", label: "All clusters", depth: 0 },
    ...path.map((node, i) => ({ key: node.id, label: node.name, depth: i + 1 })),
  ];

  function handleDrill(node: CostNode) {
    setDirection(1);
    setHoveredId(null);
    drillInto(node);
  }

  function handleNavigate(depth: number) {
    setDirection(-1);
    setHoveredId(null);
    goToDepth(depth);
  }

  function handleRangeChange(next: TimeRange) {
    setHoveredId(null);
    setRange(next);
    // Keep the drill position; rescale ancestor totals for the new range.
    rescaleForRange(next);
  }

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : dir * 28 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : dir * -28 }),
  };

  return (
    <section
      aria-labelledby="cost-explorer-heading"
      className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-24"
    >
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand">
          Spend analytics
        </p>
        <h2
          id="cost-explorer-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
        >
          Cost explorer
        </h2>
        <p className="mt-2 max-w-prose text-ink-2">
          Click a bar or a name to drill from clusters into namespaces and pods.
          Drilling back is instant — served from cache.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Breadcrumb crumbs={crumbs} onNavigate={handleNavigate} />
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-strong">
              Aggregated by {LEVEL_SINGULAR[level]}
            </span>
          </div>
          <TimeRangeSelector value={range} onChange={handleRangeChange} />
        </div>
      </header>

      {isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : (
        <motion.div
          // `initial` must not depend on reduceMotion: it renders during SSR,
          // and useReducedMotion differs server vs client (→ hydration mismatch).
          // Gate the motion via duration instead.
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }}
        >
          <SavingsCallout
            nodes={sorted}
            unitLabel={LEVEL_PLURAL[level].toLowerCase()}
            isLoading={isPending}
          />
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
              <span className="text-xs uppercase tracking-wide text-ink-3">
                Bars sized by
              </span>
              <ResourceFilter value={barMetric} onChange={setBarMetric} />
            </div>

            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={`${level}:${parent?.id ?? "root"}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
              >
                <div className="border-b border-line p-4 sm:p-6">
                  <CostBarChart
                    nodes={sorted}
                    isLoading={isPending}
                    metricKey={barMetric}
                    hoveredId={hoveredId}
                    onHover={setHoveredId}
                    canDrill={canDrill}
                    onSelect={handleDrill}
                  />
                </div>
                <CostTable
                  nodes={sorted}
                  isLoading={isPending}
                  entityLabel={LEVEL_SINGULAR[level]}
                  sort={sort}
                  onSort={toggleSort}
                  hoveredId={hoveredId}
                  onHover={setHoveredId}
                  canDrill={canDrill}
                  onSelect={handleDrill}
                />
              </motion.div>
            </AnimatePresence>
          </Card>
        </motion.div>
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
