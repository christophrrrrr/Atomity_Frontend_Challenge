import type { CostNode } from "./types";

/** Nodes below this efficiency are flagged as optimization candidates. */
export const EFFICIENCY_THRESHOLD = 40;

/** Assume ~60% of the wasted (idle) spend is realistically recoverable. */
const RECOVERABLE_FRACTION = 0.6;

export interface SavingsEstimate {
  /** Estimated recoverable monthly spend, in dollars. */
  savings: number;
  /** How many nodes fall below the efficiency threshold. */
  lowCount: number;
  total: number;
  threshold: number;
}

/**
 * Folds in Option B's "optimization insight": estimates how much of the current
 * view's spend could be recovered, based on each node's efficiency (the lower
 * the efficiency, the more idle spend there is to reclaim).
 */
export function estimateSavings(nodes: CostNode[]): SavingsEstimate {
  let savings = 0;
  let lowCount = 0;
  for (const node of nodes) {
    const wasted = (100 - node.metrics.efficiency) / 100;
    savings += node.metrics.total * wasted * RECOVERABLE_FRACTION;
    if (node.metrics.efficiency < EFFICIENCY_THRESHOLD) lowCount += 1;
  }
  return {
    savings: Math.round(savings),
    lowCount,
    total: nodes.length,
    threshold: EFFICIENCY_THRESHOLD,
  };
}
