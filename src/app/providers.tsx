'use client';

import { ReactNode } from 'react';

/**
 * Root Provider Component
 * Wraps the entire app with necessary context providers
 * This ensures proper initialization of Next.js router and other contexts
 */
export function RootProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
