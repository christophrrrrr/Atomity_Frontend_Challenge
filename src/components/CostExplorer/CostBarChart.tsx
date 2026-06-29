"use client";

import { Skeleton } from "@/components/primitives/Skeleton";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { CostNode } from "@/lib/types";

interface CostBarChartProps {
  nodes: CostNode[];
  isLoading: boolean;
  /** Currently highlighted node id, shared with the table for linked hover. */
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  /** Whether bars can be drilled into (false at the deepest level). */
  canDrill: boolean;
  onSelect: (node: CostNode) => void;
}

const GRIDLINES = 4;
const SKELETON_HEIGHTS = [82, 64, 95, 48, 73, 38, 56, 30];

export function CostBarChart({
  nodes,
  isLoading,
  hoveredId,
  onHover,
  canDrill,
  onSelect,
}: CostBarChartProps) {
  const max = Math.max(1, ...nodes.map((n) => n.metrics.total));

  return (
    <div>
      <div className="relative h-48 sm:h-60">
        {/* Dashed gridlines sit behind the bars. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col justify-between"
        >
          {Array.from({ length: GRIDLINES + 1 }).map((_, i) => (
            <div key={i} className="border-t border-dashed border-line" />
          ))}
        </div>

        <div className="relative flex h-full items-end gap-2 sm:gap-3">
          {isLoading
            ? SKELETON_HEIGHTS.map((h, i) => (
                <div key={i} className="flex flex-1 items-end justify-center">
                  <Skeleton
                    className="w-full max-w-[46px] rounded-t-md"
                    style={{ blockSize: `${h}%` }}
                  />
                </div>
              ))
            : nodes.map((node) => {
                const heightPct = Math.max(2, (node.metrics.total / max) * 100);
                const active = hoveredId === node.id;
                const dimmed = hoveredId !== null && !active;
                return (
                  <div
                    key={node.id}
                    className="flex flex-1 items-end justify-center"
                  >
                    <button
                      type="button"
                      onMouseEnter={() => onHover(node.id)}
                      onMouseLeave={() => onHover(null)}
                      onFocus={() => onHover(node.id)}
                      onBlur={() => onHover(null)}
                      onClick={canDrill ? () => onSelect(node) : undefined}
                      aria-label={
                        canDrill
                          ? `Drill into ${node.name}, ${formatCurrency(node.metrics.total)}`
                          : `${node.name}, ${formatCurrency(node.metrics.total)}`
                      }
                      style={{ blockSize: `${heightPct}%` }}
                      className={`group relative w-full max-w-[46px] rounded-t-md transition-[background-color,opacity,transform] duration-200 hover:-translate-y-0.5 hover:bg-brand ${
                        active ? "bg-brand" : "bg-brand-bar"
                      } ${dimmed ? "opacity-40" : "opacity-100"} ${
                        canDrill ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <span
                        className={`pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-medium text-canvas transition-opacity ${
                          active ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {formatCompactCurrency(node.metrics.total)}
                      </span>
                    </button>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Bar labels, aligned to the bars by matching flex + gap. */}
      <div className="mt-3 flex gap-2 sm:gap-3">
        {(isLoading ? SKELETON_HEIGHTS : nodes).map((item, i) => (
          <div key={isLoading ? i : (item as CostNode).id} className="min-w-0 flex-1">
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
  );
}
