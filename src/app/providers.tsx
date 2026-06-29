"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Served from cache for 5 min before a view is considered stale —
        // revisiting a drill level is instant with no refetch.
        staleTime: 5 * 60 * 1000,
        // Keep unused views cached for 30 min so drilling out and back in is free.
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

/** Client provider tree: data caching (TanStack Query) + theming. */
export function Providers({ children }: { children: React.ReactNode }) {
  // One client per browser session; created lazily so it isn't shared across
  // requests on the server.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
