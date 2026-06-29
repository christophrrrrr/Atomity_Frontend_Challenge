"use client";

import { Skeleton } from "@/components/primitives/Skeleton";
import type { SortKey, SortState } from "@/hooks/useNodeSort";
import { RESOURCES } from "@/lib/resources";
import type { CostNode } from "@/lib/types";
import { CostTableRow } from "./CostTableRow";

interface Column {
  key: SortKey;
  label: string;
}

/** Numeric columns after the entity-name column. */
const COLUMNS: Column[] = [
  ...RESOURCES.map((r): Column => ({ key: r.key, label: r.label })),
  { key: "efficiency", label: "Efficiency" },
  { key: "total", label: "Total" },
];

interface CostTableProps {
  nodes: CostNode[];
  isLoading: boolean;
  /** Label for the first column, e.g. "Cluster". */
  entityLabel: string;
  sort: SortState;
  onSort: (key: SortKey) => void;
  /** Linked-hover state shared with the bar chart. */
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  /** Whether rows can be drilled into (false at the deepest level). */
  canDrill: boolean;
  onSelect: (node: CostNode) => void;
}

export function CostTable({
  nodes,
  isLoading,
  entityLabel,
  sort,
  onSort,
  hoveredId,
  onHover,
  canDrill,
  onSelect,
}: CostTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-ink-3">
            <SortableHeader
              label={entityLabel}
              sortKey="name"
              align="start"
              sort={sort}
              onSort={onSort}
            />
            {COLUMNS.map((col) => (
              <SortableHeader
                key={col.key}
                label={col.label}
                sortKey={col.key}
                align="end"
                sort={sort}
                onSort={onSort}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            : nodes.map((node) => (
                <CostTableRow
                  key={node.id}
                  node={node}
                  isHighlighted={node.id === hoveredId}
                  onHover={onHover}
                  canDrill={canDrill}
                  onSelect={onSelect}
                />
              ))}
        </tbody>
      </table>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  align,
  sort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  align: "start" | "end";
  sort: SortState;
  onSort: (key: SortKey) => void;
}) {
  const active = sort.key === sortKey;
  const ariaSort = active
    ? sort.direction === "asc"
      ? "ascending"
      : "descending"
    : "none";

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`px-4 py-2.5 font-medium ${align === "end" ? "text-end" : "text-start"}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`group inline-flex items-center gap-1 rounded transition-colors hover:text-ink ${
          active ? "text-ink" : ""
        } ${align === "end" ? "flex-row-reverse" : ""}`}
      >
        <span>{label}</span>
        <SortArrow active={active} direction={sort.direction} />
      </button>
    </th>
  );
}

function SortArrow({
  active,
  direction,
}: {
  active: boolean;
  direction: "asc" | "desc";
}) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`size-3 transition-opacity ${
        active ? "text-brand opacity-100" : "opacity-0 group-hover:opacity-40"
      }`}
      aria-hidden="true"
    >
      <path
        d={active && direction === "asc" ? "M6 3l4 6H2z" : "M6 9 2 3h8z"}
        fill="currentColor"
      />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-t border-line">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-28" />
      </td>
      {COLUMNS.map((col) => (
        <td key={col.key} className="px-4 py-3">
          <Skeleton className="ms-auto h-4 w-12" />
        </td>
      ))}
    </tr>
  );
}
