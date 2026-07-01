import { useQuery } from "@tanstack/react-query";
import { fetchLevel } from "@/lib/api";
import type { CostNode, Level, TimeRange } from "@/lib/types";

/**
 * Fetches the cost nodes for one view (a level + its parent + the time range).
 *
 * The query key encodes everything that changes the data — level, parent id,
 * and time range — so TanStack Query caches each view independently. Drilling
 * back to a previously-seen view is served from cache (no network), while the
 * first visit shows a loading state. `staleTime`/`gcTime` defaults live on the
 * QueryClient in providers.tsx.
 */
export function useCostData(
  level: Level,
  parent: CostNode | null,
  range: TimeRange,
) {
  return useQuery({
    queryKey: ["costs", level, parent?.id ?? "root", range.id],
    queryFn: ({ signal }) => fetchLevel(level, parent, range, signal),
    // Namespace/pod views can't run until their parent is known.
    enabled: level === "cluster" || parent !== null,
  });
}
