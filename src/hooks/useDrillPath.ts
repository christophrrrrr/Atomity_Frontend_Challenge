import { useCallback, useState } from "react";
import { rescalePath } from "@/lib/deriveMetrics";
import { childLevel } from "@/lib/levels";
import type { CostNode, Level, TimeRange } from "@/lib/types";

/**
 * Tracks the drill path as a stack of selected ancestor nodes.
 *   path = []                       → viewing clusters
 *   path = [cluster]                → viewing that cluster's namespaces
 *   path = [cluster, namespace]     → viewing that namespace's pods
 *
 * The current `level` is the child level of the last node in the path (or
 * "cluster" at the root), and `parent` is that last node — exactly the inputs
 * `useCostData` needs.
 */
export function useDrillPath() {
  const [path, setPath] = useState<CostNode[]>([]);

  const parent = path.length > 0 ? path[path.length - 1] : null;
  // Path only ever holds drillable nodes, so childLevel is never null here.
  const level: Level = parent ? (childLevel(parent.level) as Level) : "cluster";

  const drillInto = useCallback((node: CostNode) => {
    if (childLevel(node.level) === null) return; // leaf node — nothing to drill
    setPath((prev) => [...prev, node]);
  }, []);

  /** Jump to a breadcrumb depth: 0 = root (clusters), n = after n ancestors. */
  const goToDepth = useCallback((depth: number) => {
    setPath((prev) => prev.slice(0, depth));
  }, []);

  /** Recompute the path's metrics for a new time range, keeping the position. */
  const rescaleForRange = useCallback((range: TimeRange) => {
    setPath((prev) => rescalePath(prev, range));
  }, []);

  /** Replace the whole path (used when restoring state from the URL). */
  const restorePath = useCallback((next: CostNode[]) => setPath(next), []);

  return {
    path,
    level,
    parent,
    drillInto,
    goToDepth,
    rescaleForRange,
    restorePath,
  };
}
