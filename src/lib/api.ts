import type { RawItem } from "./derive";
import type { Level } from "./types";

const BASE_URL = "https://jsonplaceholder.typicode.com";

/**
 * Artificial latency so the first-fetch loading skeleton is perceptible and the
 * cached "instant on revisit" contrast is obvious in a demo. Set to 0 to use
 * JSONPlaceholder's real latency.
 */
export const SIMULATED_LATENCY_MS = 450;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { signal });
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }
  const data = (await res.json()) as T;
  if (SIMULATED_LATENCY_MS > 0) await sleep(SIMULATED_LATENCY_MS);
  return data;
}

/**
 * Fetch the raw records for a level — clusters from users, namespaces from a
 * user's posts, pods from a post's comments. Range-independent on purpose: the
 * time range is applied later in `deriveNodes`, so the raw list is cached once
 * and switching ranges never refetches.
 */
export function fetchRawLevel(
  level: Level,
  parentSourceId: number | null,
  signal?: AbortSignal,
): Promise<RawItem[]> {
  if (level === "cluster") return fetchJson<RawItem[]>("/users", signal);
  if (parentSourceId == null) {
    throw new Error(`A parent id is required to load ${level}s`);
  }
  return level === "namespace"
    ? fetchJson<RawItem[]>(`/posts?userId=${parentSourceId}`, signal)
    : fetchJson<RawItem[]>(`/comments?postId=${parentSourceId}`, signal);
}
