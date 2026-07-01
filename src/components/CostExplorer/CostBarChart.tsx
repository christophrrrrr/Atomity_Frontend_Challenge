"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/primitives/AnimatedNumber";
import { Skeleton } from "@/components/primitives/Skeleton";
import { TrendBadge } from "@/components/primitives/TrendBadge";
import { deriveTrend } from "@/lib/deriveMetrics";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { BarMetric, CostNode } from "@/lib/types";
import { tokens } from "@/tokens/tokens";

interface CostBarChartProps {
  nodes: CostNode[];
  isLoading: boolean;
  /** Which metric the bar heights represent. */
  metricKey: BarMetric;
  /** Currently highlighted node id, shared with the table for linked hover. */
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  /** Whether bars can be drilled into (false at the deepest level). */
  canDrill: boolean;
  onSelect: (node: CostNode) => void;
}

const GRIDLINES = 4;
const SKELETON_HEIGHTS = [82, 64, 95, 48, 73, 38, 56, 30];

/** Fill color encodes efficiency: low reads red, high reads green. */
function efficiencyColor(efficiency: number): string {
  const clamped = Math.max(0, Math.min(100, efficiency));
  return `color-mix(in oklab, ${tokens.color.positive} ${clamped}%, ${tokens.color.negative})`;
}

export function CostBarChart({
  nodes,
  isLoading,
  metricKey,
  hoveredId,
  onHover,
  canDrill,
  onSelect,
}: CostBarChartProps) {
  const reduceMotion = useReducedMotion();
  const max = Math.max(1, ...nodes.map((n) => n.metrics[metricKey]));

  // Total spend for this view + overall period-over-period change.
  const total = nodes.reduce((sum, n) => sum + n.metrics.total, 0);
  const previous = nodes.reduce(
    (sum, n) => sum + n.metrics.total / (1 + deriveTrend(n.id)),
    0,
  );
  const overallDelta = previous > 0 ? (total - previous) / previous : 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="text-sm text-ink-2">
          Total spend
          {isLoading ? (
            <Skeleton className="ms-2 inline-block h-5 w-20 align-middle" />
          ) : (
            <span className="ms-2 text-lg font-semibold text-ink">
              <AnimatedNumber value={total} format={formatCurrency} />
            </span>
          )}
        </div>
        {!isLoading && (
          <span className="flex items-center gap-1.5 text-xs text-ink-3">
            <TrendBadge value={overallDelta} />
            vs previous period
          </span>
        )}
      </div>

      <div className="flex gap-2 sm:gap-3">
        {/* Y-axis: dollar value at each gridline. */}
        <div className="relative h-48 shrink-0 sm:h-60" aria-hidden="true">
          <div className="w-10">
            {!isLoading &&
              Array.from({ length: GRIDLINES + 1 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute end-0 -translate-y-1/2 text-[10px] tabular-nums text-ink-3"
                  style={{ top: `${(i / GRIDLINES) * 100}%` }}
                >
                  {formatCompactCurrency(max * (1 - i / GRIDLINES))}
                </span>
              ))}
          </div>
        </div>

        <div className="relative h-48 flex-1 sm:h-60">
          <div className="absolute inset-0 flex flex-col justify-between">
            {Array.from({ length: GRIDLINES + 1 }).map((_, i) => (
              <div key={i} className="border-t border-dashed border-line" />
            ))}
          </div>

          <div className="relative flex h-full items-stretch gap-2 sm:gap-3">
            {isLoading
              ? SKELETON_HEIGHTS.map((h, i) => (
                  <div key={i} className="relative h-full flex-1">
                    <Skeleton
                      className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[46px] rounded-t-md"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))
              : nodes.map((node, index) => {
                  const value = node.metrics[metricKey];
                  const heightPct = Math.max(2, (value / max) * 100);
                  const active = hoveredId === node.id;
                  const dimmed = hoveredId !== null && !active;
                  return (
                    <div key={node.id} className="relative h-full flex-1">
                      <motion.button
                        type="button"
                        onMouseEnter={() => onHover(node.id)}
                        onMouseLeave={() => onHover(null)}
                        onFocus={() => onHover(node.id)}
                        onBlur={() => onHover(null)}
                        onClick={canDrill ? () => onSelect(node) : undefined}
                        aria-label={
                          canDrill
                            ? `Drill into ${node.name}, ${formatCurrency(value)}, ${node.metrics.efficiency}% efficient`
                            : `${node.name}, ${formatCurrency(value)}, ${node.metrics.efficiency}% efficient`
                        }
                        style={{
                          height: `${heightPct}%`,
                          transformOrigin: "bottom",
                          backgroundColor: efficiencyColor(node.metrics.efficiency),
                        }}
                        initial={reduceMotion ? false : { scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: dimmed ? 0.4 : 1 }}
                        whileHover={reduceMotion ? undefined : { y: -3 }}
                        transition={{
                          scaleY: reduceMotion
                            ? { duration: 0 }
                            : { delay: index * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.2 },
                          y: { type: "spring", stiffness: 400, damping: 26 },
                        }}
                        className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-[46px] rounded-t-md ${
                          active ? "brightness-110" : ""
                        } ${canDrill ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <span
                          className={`pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-medium text-canvas transition-opacity ${
                            active ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          {formatCompactCurrency(value)}
                        </span>
                      </motion.button>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>

      {/* Bar labels, offset to line up with the bars (past the y-axis). */}
      <div className="mt-3 flex gap-2 sm:gap-3">
        <div className="w-10 shrink-0" aria-hidden="true" />
        <div className="flex flex-1 gap-2 sm:gap-3">
          {(isLoading ? SKELETON_HEIGHTS : nodes).map((item, i) => (
            <div
              key={isLoading ? i : (item as CostNode).id}
              className="min-w-0 flex-1"
            >
              {isLoading ? (
                <Skeleton className="mx-auto h-3 w-12" />
              ) : (
                <p
                  className={`truncate text-center text-xs transition-colors ${
                    hoveredId === (item as CostNode).id
                      ? "font-medium text-ink"
                      : "text-ink-2"
                  }`}
                  title={(item as CostNode).name}
                >
                  {(item as CostNode).name}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend for the efficiency color scale. */}
      <div className="mt-4 flex items-center gap-2 text-xs text-ink-3">
        <span>Bar color = efficiency</span>
        <span
          className="h-2 w-16 rounded-full"
          style={{
            background: `linear-gradient(to right, ${tokens.color.negative}, ${tokens.color.positive})`,
          }}
          aria-hidden="true"
        />
        <span>low → high</span>
      </div>
    </div>
  );
}
