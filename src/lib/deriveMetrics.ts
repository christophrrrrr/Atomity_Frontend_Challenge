import type {
  CostNode,
  Metrics,
  ResourceBreakdown,
  ResourceKey,
  TimeRange,
} from "./types";

/**
 * Cost numbers are *derived* from the fetched JSONPlaceholder ids rather than
 * stored anywhere, so they are:
 *   - stable across renders (same id → same value, no flicker on re-render),
 *   - hierarchical & additive (a node's children sum exactly to the node),
 *   - varied per time range (a multiplier scales magnitudes).
 *
 * This keeps the data 100% fetched-driven while looking like a real cost
 * breakdown. The brief explicitly allows non-real numbers — what matters is
 * async state + caching, which the rest of the data layer handles.
 */

const RESOURCE_KEYS: ResourceKey[] = ["cpu", "ram", "storage", "network", "gpu"];

/** FNV-1a hash → unsigned 32-bit int. Deterministic and well-distributed. */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — tiny, fast, deterministic for a given seed. */
function rng(seed: string): () => number {
  let a = hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Base monthly spend for a top-level cluster, scaled by the time range. */
export function clusterTotal(sourceId: number, multiplier: number): number {
  const next = rng(`cluster-total:${sourceId}`);
  const base = 1800 + Math.floor(next() * 5600); // ~$1.8k–$7.4k / 30 days
  return Math.round(base * multiplier);
}

/**
 * Split a parent total across `seeds.length` children using deterministic
 * weights, reconciling rounding so the parts sum back to exactly `parentTotal`.
 */
export function distributeTotal(parentTotal: number, seeds: string[]): number[] {
  if (seeds.length === 0) return [];
  // Skewed weights (squared) so a few children dominate — more realistic.
  const weights = seeds.map((s) => {
    const w = rng(`weight:${s}`)();
    return 0.05 + w * w;
  });
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const parts = weights.map((w) => Math.round((parentTotal * w) / weightSum));
  const drift = parentTotal - parts.reduce((a, b) => a + b, 0);
  // Push any rounding drift onto the largest part so the sum stays exact.
  parts[indexOfMax(parts)] += drift;
  return parts;
}

/** Split a node total into the five resource costs that sum back to it. */
function splitResources(total: number, seed: string): ResourceBreakdown {
  const next = rng(`resources:${seed}`);
  const weights = RESOURCE_KEYS.map(() => 0.4 + next());
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const values = weights.map((w) => Math.round((total * w) / weightSum));
  const drift = total - values.reduce((a, b) => a + b, 0);
  values[indexOfMax(values)] += drift;

  return RESOURCE_KEYS.reduce((acc, key, i) => {
    acc[key] = Math.max(0, values[i]);
    return acc;
  }, {} as ResourceBreakdown);
}

/** Utilization efficiency 6–94%, skewed so most nodes sit mid-range. */
function deriveEfficiency(seed: string): number {
  const r = rng(`efficiency:${seed}`)();
  return Math.round(6 + r * 88);
}

/**
 * Period-over-period change for a node, as a signed fraction in ~[-0.28, 0.28]
 * (e.g. 0.12 = spend up 12% vs the previous period). Deterministic per node and
 * independent of the selected range.
 */
export function deriveTrend(seed: string): number {
  const r = rng(`trend:${seed}`)();
  return Math.round((r * 0.56 - 0.28) * 100) / 100;
}

/** Build a full Metrics object for a node from its total and a seed. */
export function buildMetrics(total: number, seed: string): Metrics {
  const resources = splitResources(total, seed);
  const exactTotal = RESOURCE_KEYS.reduce((sum, k) => sum + resources[k], 0);
  return {
    ...resources,
    total: exactTotal,
    efficiency: deriveEfficiency(seed),
  };
}

/**
 * Recompute a drill path's metrics for a new time range, in place and
 * synchronously. A cluster's total comes straight from its id + the new
 * multiplier; deeper nodes scale their parent's new total by their stored,
 * range-independent `share`. Keeps the user's drill position consistent when
 * the time range changes, with no extra fetches.
 */
export function rescalePath(path: CostNode[], range: TimeRange): CostNode[] {
  const result: CostNode[] = [];
  path.forEach((node, i) => {
    const total =
      node.level === "cluster"
        ? clusterTotal(node.sourceId, range.multiplier)
        : Math.round(result[i - 1].metrics.total * node.share);
    result.push({ ...node, metrics: buildMetrics(total, node.id) });
  });
  return result;
}

function indexOfMax(arr: number[]): number {
  let best = 0;
  for (let i = 1; i < arr.length; i++) if (arr[i] > arr[best]) best = i;
  return best;
}
