import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchRawLevel } from "@/lib/api";
import { deriveNodes } from "@/lib/derive";
import type { CostNode, Level, TimeRange } from "@/lib/types";

/**
 * Fetches the cost nodes for one view (a level + its parent + the time range).
 *
 * The *raw* list is fetched under a range-independent key, so it's fetched once
 * and drilling back to a seen view — or switching the time range — is served
 * from cache with no network. The range math is applied in memory via
 * `deriveNodes`. First visit to a level shows a loading state; `staleTime` /
 * `gcTime` defaults live on the QueryClient in providers.tsx.
 */
export function useCostData(
  level: Level,
  parent: CostNode | null,
  range: TimeRange,
) {
  const raw = useQuery({
    queryKey: ["raw", level, parent?.sourceId ?? "root"],
    queryFn: ({ signal }) =>
      fetchRawLevel(level, parent?.sourceId ?? null, signal),
    // Namespace/pod views can't run until their parent is known.
    enabled: level === "cluster" || parent !== null,
  });

  const data = useMemo(
    () => (raw.data ? deriveNodes(level, raw.data, parent, range) : undefined),
    [raw.data, level, parent, range],
  );

  return {
    data,
    isPending: raw.isPending,
    isError: raw.isError,
    error: raw.error,
    refetch: raw.refetch,
  };
}
