'use client';

import { ReactNode, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { makeStore } from '@/store';

/**
 * Root Provider Component
 * Wraps the entire app with the TanStack Query client (server state) and the
 * Redux store (cart). Both are created once per browser tab.
 */
export function RootProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  const [store] = useState(makeStore);

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ReduxProvider>
  );
}
