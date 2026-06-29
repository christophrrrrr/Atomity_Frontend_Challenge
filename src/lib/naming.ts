/**
 * Maps fetched JSONPlaceholder ids to realistic Kubernetes-style names. The id
 * fully determines the name, so names are stable and "derived from the API",
 * but read like real infrastructure rather than latin filler.
 */

const CLUSTERS = [
  "prod-us-east-1",
  "prod-eu-west-1",
  "prod-ap-south-1",
  "staging-us-east-1",
  "staging-eu-west-1",
  "dev-us-west-2",
  "data-us-east-1",
  "ml-prod-us-east-1",
  "edge-eu-central-1",
  "prod-us-west-1",
];

// Length (16) > children-per-parent (10) guarantees distinct names within a
// cluster, since a user's posts have 10 consecutive ids.
const NAMESPACES = [
  "payments",
  "checkout",
  "api-gateway",
  "auth",
  "search",
  "ml-serving",
  "analytics",
  "notifications",
  "ingestion",
  "billing",
  "frontend",
  "cache",
  "scheduler",
  "logging",
  "monitoring",
  "media-proc",
];

const POD_APPS = [
  "api-server",
  "worker",
  "web",
  "redis",
  "indexer",
  "consumer",
  "scheduler",
  "gateway",
];

export function clusterName(sourceId: number): string {
  return CLUSTERS[(sourceId - 1) % CLUSTERS.length];
}

export function namespaceName(sourceId: number): string {
  return NAMESPACES[(sourceId - 1) % NAMESPACES.length];
}

export function podName(sourceId: number): string {
  const app = POD_APPS[(sourceId - 1) % POD_APPS.length];
  // Short, id-derived hex suffix like a real pod hash.
  const suffix = (sourceId * 2654435761).toString(16).slice(-4);
  return `${app}-${suffix}`;
}
