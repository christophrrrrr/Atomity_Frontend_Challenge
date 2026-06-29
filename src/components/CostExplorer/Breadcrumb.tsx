"use client";

export interface Crumb {
  key: string;
  label: string;
  /** Drill depth this crumb navigates to (0 = root). */
  depth: number;
}

/** Accessible breadcrumb trail for the drill path. */
export function Breadcrumb({
  crumbs,
  onNavigate,
}: {
  crumbs: Crumb[];
  onNavigate: (depth: number) => void;
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.key} className="flex items-center gap-1">
              {i > 0 && <Separator />}
              {isLast ? (
                <span aria-current="page" className="font-medium text-ink">
                  {crumb.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate(crumb.depth)}
                  className="rounded font-medium text-ink-2 transition-colors hover:text-brand"
                >
                  {crumb.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Separator() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 text-ink-3"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
