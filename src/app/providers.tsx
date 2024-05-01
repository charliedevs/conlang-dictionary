"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CSPostHogProvider } from "./_analytics/provider";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <CSPostHogProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </CSPostHogProvider>
  );
}
