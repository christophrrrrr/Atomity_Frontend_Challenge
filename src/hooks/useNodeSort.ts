import { useCallback, useMemo, useState } from "react";
import type { CostNode, ResourceKey } from "@/lib/types";

export type SortKey = "name" | ResourceKey | "efficiency" | "total";
export type SortDirection = "asc" | "desc";

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

const DEFAULT_SORT: SortState = { key: "total", direction: "desc" };

function compare(a: CostNode, b: CostNode, key: SortKey): number {
  if (key === "name") return a.name.localeCompare(b.name);
  // Every other key is a numeric field on Metrics.
  return a.metrics[key] - b.metrics[key];
}

/**
 * Sorts cost nodes by a chosen column. Clicking a new column sorts by it
 * (descending for numbers, ascending for names); clicking the active column
 * flips direction. Lifting this into a hook lets the chart and table later
 * share one ordering.
 */
export function useNodeSort(nodes: CostNode[] | undefined) {
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

  const sorted = useMemo(() => {
    const list = [...(nodes ?? [])];
    list.sort((a, b) => {
      const result = compare(a, b, sort.key);
      return sort.direction === "asc" ? result : -result;
    });
    return list;
  }, [nodes, sort]);

  const toggleSort = useCallback((key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "name" ? "asc" : "desc" },
    );
  }, []);

  return { sorted, sort, toggleSort };
}
