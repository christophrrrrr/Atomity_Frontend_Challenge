import { buildMetrics, clusterTotal, distributeTotal } from "./deriveMetrics";
import { clusterName, namespaceName, podName } from "./naming";
import type { CostNode, Level, TimeRange } from "./types";

const BASE_URL = "https://jsonplaceholder.typicode.com";

/**
 * Artificial latency so the first-fetch loading skeleton is perceptible and the
 * cached "instant on revisit" contrast is obvious in a demo. Set to 0 to use
 * JSONPlaceholder's real latency.
 */
export const SIMULATED_LATENCY_MS = 450;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface JUser {
  id: number;
}
interface JPost {
  id: number;
  userId: number;
}
interface JComment {
  id: number;
  postId: number;
}

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { signal });
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }
  const data = (await res.json()) as T;
  if (SIMULATED_LATENCY_MS > 0) await sleep(SIMULATED_LATENCY_MS);
  return data;
}

const byTotalDesc = (a: CostNode, b: CostNode) => b.metrics.total - a.metrics.total;

/** Clusters = JSONPlaceholder users. Totals are seeded from the user id. */
export async function fetchClusters(
  range: TimeRange,
  signal?: AbortSignal,
): Promise<CostNode[]> {
  const users = await fetchJson<JUser[]>("/users", signal);
  return users
    .map<CostNode>((user) => {
      const seed = `cluster:${user.id}`;
      const total = clusterTotal(user.id, range.multiplier);
      return {
        id: seed,
        sourceId: user.id,
        level: "cluster",
        name: clusterName(user.id),
        parentId: null,
        share: 1,
        metrics: buildMetrics(total, seed),
      };
    })
    .sort(byTotalDesc);
}

/** Namespaces = a cluster-user's posts. Their totals sum to the cluster total. */
export async function fetchNamespaces(
  parent: CostNode,
  signal?: AbortSignal,
): Promise<CostNode[]> {
  const posts = await fetchJson<JPost[]>(
    `/posts?userId=${parent.sourceId}`,
    signal,
  );
  const seeds = posts.map((p) => `namespace:${p.id}`);
  const totals = distributeTotal(parent.metrics.total, seeds);
  return posts
    .map<CostNode>((post, i) => ({
      id: seeds[i],
      sourceId: post.id,
      level: "namespace",
      name: namespaceName(post.id),
      parentId: parent.id,
      share: parent.metrics.total > 0 ? totals[i] / parent.metrics.total : 0,
      metrics: buildMetrics(totals[i], seeds[i]),
    }))
    .sort(byTotalDesc);
}

/** Pods = a namespace-post's comments. Their totals sum to the namespace total. */
export async function fetchPods(
  parent: CostNode,
  signal?: AbortSignal,
): Promise<CostNode[]> {
  const comments = await fetchJson<JComment[]>(
    `/comments?postId=${parent.sourceId}`,
    signal,
  );
  const seeds = comments.map((c) => `pod:${c.id}`);
  const totals = distributeTotal(parent.metrics.total, seeds);
  return comments
    .map<CostNode>((comment, i) => ({
      id: seeds[i],
      sourceId: comment.id,
      level: "pod",
      name: podName(comment.id),
      parentId: parent.id,
      share: parent.metrics.total > 0 ? totals[i] / parent.metrics.total : 0,
      metrics: buildMetrics(totals[i], seeds[i]),
    }))
    .sort(byTotalDesc);
}

/** Fetch the nodes for any view. Shared by the query hook and URL restore. */
export function fetchLevel(
  level: Level,
  parent: CostNode | null,
  range: TimeRange,
  signal?: AbortSignal,
): Promise<CostNode[]> {
  if (level === "cluster") return fetchClusters(range, signal);
  if (!parent) throw new Error(`A parent node is required to load ${level}s`);
  return level === "namespace"
    ? fetchNamespaces(parent, signal)
    : fetchPods(parent, signal);
}
