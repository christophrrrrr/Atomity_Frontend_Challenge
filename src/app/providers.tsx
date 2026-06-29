"use client";

import { ThemeProvider } from "@/components/theme/ThemeProvider";

/**
 * Client-side provider tree. The TanStack Query provider is added here in the
 * data-layer step; for now it establishes theming.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
