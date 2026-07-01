"use client";

import { useCallback } from "react";

const STORAGE_KEY = "atomity-theme";

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2L19 19M19 5l-1.8 1.8M6.8 17.2L5 19" />
      </g>
    </svg>
  );
}

function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M20 13.5A8 8 0 0 1 10.5 4a7 7 0 1 0 9.5 9.5Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Theme toggle. Which icon shows is driven purely by the `.dark` class via CSS
 * (`dark:` variant), so there's no client-only React state and no hydration
 * concern — the icons just cross-fade when the class flips. The no-flash init
 * script sets the initial class before paint.
 */
export function ThemeToggle() {
  const toggle = useCallback(() => {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage may be unavailable (private mode) — theme still applies live */
    }
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="grid size-9 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-sm transition-colors hover:bg-surface-2 hover:text-ink"
    >
      <span className="relative grid size-[18px] place-items-center">
        <SunIcon className="col-start-1 row-start-1 size-[18px] transition-[opacity,transform] duration-200 dark:rotate-90 dark:opacity-0" />
        <MoonIcon className="col-start-1 row-start-1 size-[18px] rotate-90 opacity-0 transition-[opacity,transform] duration-200 dark:rotate-0 dark:opacity-100" />
      </span>
    </button>
  );
}
