import type { Level } from "./types";

/** Hierarchy order, outermost first. */
export const LEVELS: Level[] = ["cluster", "namespace", "pod"];

export const LEVEL_SINGULAR: Record<Level, string> = {
  cluster: "Cluster",
  namespace: "Namespace",
  pod: "Pod",
};

export const LEVEL_PLURAL: Record<Level, string> = {
  cluster: "Clusters",
  namespace: "Namespaces",
  pod: "Pods",
};

/** The level you reach by drilling into a node, or null at the deepest level. */
export function childLevel(level: Level): Level | null {
  const i = LEVELS.indexOf(level);
  return i >= 0 && i < LEVELS.length - 1 ? LEVELS[i + 1] : null;
}
