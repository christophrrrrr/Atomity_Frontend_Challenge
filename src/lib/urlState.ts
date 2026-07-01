import type { CostNode, TimeRangeId } from "./types";

const VALID_RANGES: TimeRangeId[] = ["7d", "30d", "90d"];

/**
 * Serialize the explorer view into a query string: the time range and the drill
 * path (as source ids). The default range is omitted to keep clean URLs.
 */
export function encodeExplorerState(
  rangeId: TimeRangeId,
  path: CostNode[],
): string {
  const params = new URLSearchParams();
  if (rangeId !== "30d") params.set("range", rangeId);
  if (path.length > 0) {
    params.set("path", path.map((node) => node.sourceId).join("."));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Parse a query string back into a range + the source ids of the drill path. */
export function parseExplorerState(search: string): {
  rangeId?: TimeRangeId;
  sourceIds: number[];
} {
  const params = new URLSearchParams(search);
  const rawRange = params.get("range");
  const rangeId =
    rawRange && VALID_RANGES.includes(rawRange as TimeRangeId)
      ? (rawRange as TimeRangeId)
      : undefined;

  const rawPath = params.get("path");
  const sourceIds = rawPath
    ? rawPath
        .split(".")
        .map((part) => Number(part))
        .filter((n) => Number.isInteger(n) && n > 0)
    : [];

  return { rangeId, sourceIds };
}
