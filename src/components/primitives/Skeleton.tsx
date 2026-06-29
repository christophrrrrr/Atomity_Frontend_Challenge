import type { CSSProperties } from "react";

/** A neutral shimmer placeholder used while data loads. Decorative only. */
export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`animate-pulse rounded-md bg-surface-2 ${className}`}
    />
  );
}
