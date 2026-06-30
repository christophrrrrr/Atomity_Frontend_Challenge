/** The three levels of the cost hierarchy, from outermost to innermost. */
export type Level = "cluster" | "namespace" | "pod";

/** Billable resource dimensions shown as table columns and chart segments. */
export type ResourceKey = "cpu" | "ram" | "storage" | "network" | "gpu";

/** Per-resource cost in whole dollars; the five always sum to `total`. */
export type ResourceBreakdown = Record<ResourceKey, number>;

export interface Metrics extends ResourceBreakdown {
  /** Sum of the five resource costs (kept exact after rounding). */
  total: number;
  /** Utilization efficiency as a percentage, 0–100. */
  efficiency: number;
}

/** One row/bar in the explorer — a cluster, namespace, or pod. */
export interface CostNode {
  /** Stable, unique id across the whole tree, e.g. "namespace:3". */
  id: string;
  /** The originating JSONPlaceholder id this node was derived from. */
  sourceId: number;
  level: Level;
  /** Human-friendly infrastructure name, e.g. "prod-us-east-1". */
  name: string;
  /** Id of the parent node, or null at the cluster level. */
  parentId: string | null;
  /**
   * Fraction of the parent's total this node represents (0–1, range-independent;
   * 1 at the cluster root). Lets the whole drill path be rescaled instantly when
   * the time range changes.
   */
  share: number;
  metrics: Metrics;
}

/** What the bar heights represent — overall total or a single resource. */
export type BarMetric = "total" | ResourceKey;

export type TimeRangeId = "7d" | "30d" | "90d";

export interface TimeRange {
  id: TimeRangeId;
  label: string;
  /** Scales cost magnitudes so switching range produces different data. */
  multiplier: number;
}
