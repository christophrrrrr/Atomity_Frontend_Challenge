import type { ReactNode } from "react";

/** Elevated surface panel — the app's primary container shape. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-panel border border-line bg-surface shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
