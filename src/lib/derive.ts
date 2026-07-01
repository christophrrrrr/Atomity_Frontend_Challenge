import { buildMetrics, clusterTotal, distributeTotal } from "./deriveMetrics";
import { clusterName, namespaceName, podName } from "./naming";
import type { CostNode, Level, TimeRange } from "./types";

/** The only field we need from any JSONPlaceholder record. */
export interface RawItem {
  id: number;
}

const byTotalDesc = (a: CostNode, b: CostNode) => b.metrics.total - a.metrics.total;

/**
 * Build cost nodes from raw API records for a given level, parent, and range.
 * Pure and synchronous — the raw fetch is cached range-independently, and this
 * applies the range math in memory, so switching time ranges never refetches.
 */
export function deriveNodes(
  level: Level,
  raw: RawItem[],
  parent: CostNode | null,
  range: TimeRange,
): CostNode[] {
  if (level === "cluster") {
    return raw
      .map<CostNode>((item) => {
        const seed = `cluster:${item.id}`;
        const total = clusterTotal(item.id, range.multiplier);
        return {
          id: seed,
          sourceId: item.id,
          level: "cluster",
          name: clusterName(item.id),
          parentId: null,
          share: 1,
          metrics: buildMetrics(total, seed),
        };
      })
      .sort(byTotalDesc);
  }

  if (!parent) throw new Error(`A parent node is required to derive ${level}s`);

  const nameFor = level === "namespace" ? namespaceName : podName;
  const seeds = raw.map((item) => `${level}:${item.id}`);
  const totals = distributeTotal(parent.metrics.total, seeds);

  return raw
    .map<CostNode>((item, i) => ({
      id: seeds[i],
      sourceId: item.id,
      level,
      name: nameFor(item.id),
      parentId: parent.id,
      share: parent.metrics.total > 0 ? totals[i] / parent.metrics.total : 0,
      metrics: buildMetrics(totals[i], seeds[i]),
    }))
    .sort(byTotalDesc);
}
