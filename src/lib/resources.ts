import type { ResourceKey } from "./types";

export interface ResourceMeta {
  key: ResourceKey;
  label: string;
}

/** Column / segment order, matching the reference design. */
export const RESOURCES: ResourceMeta[] = [
  { key: "cpu", label: "CPU" },
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "network", label: "Network" },
  { key: "gpu", label: "GPU" },
];
