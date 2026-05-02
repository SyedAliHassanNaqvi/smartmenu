/**
 * Network utilities for handling slow connections
 * Provides timeouts and diagnostic functions for slow internet
 */

export const NETWORK_TIMEOUTS = {
  // For slow university/mobile connections (3G, low bandwidth WiFi)
  FAST_API: 3000,           // 3 seconds for local API calls
  NORMAL_API: 10000,        // 10 seconds for API calls
  SLOW_API: 15000,          // 15 seconds for API calls on slow connections
  
  DATABASE: 8000,           // 8 seconds for database connections
  DATABASE_SLOW: 10000,     // 10 seconds for database on slow connections
  
  FILE_UPLOAD: 30000,       // 30 seconds for file uploads
  EXTERNAL_API: 20000,      // 20 seconds for external API calls
};

export interface NetworkDiagnostics {
  latency: number;
  isSlowConnection: boolean;
  connectionType?: string;
  effectiveType?: string;
}

/**
 * Measure network latency by making a quick request to /api/tables
 * This helps determine if the connection is slow
 */
export async function measureNetworkLatency(): Promise<NetworkDiagnostics> {
  const startTime = performance.now();
  
  try {
    // Use a simple API endpoint to measure latency
    const response = await fetch('/api/tables', {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3 second timeout for diagnostic
    });
    
    const latency = performance.now() - startTime;
    
    // Get connection type from navigator API (if available)
    const connection = (navigator as any).connection || (navigator as any).mozConnection;
    
    return {
      latency: Math.round(latency),
      isSlowConnection: latency > 2000, // Consider >2s as slow
      connectionType: connection?.type,
      effectiveType: connection?.effectiveType, // '4g', '3g', '2g', 'slow-2g'
    };
  } catch (error) {
    return {
      latency: 9999,
      isSlowConnection: true,
      connectionType: 'unknown',
    };
  }
}

/**
 * Get appropriate timeout based on connection speed
 */
export function getTimeoutForCondition(condition: 'fast' | 'normal' | 'slow'): number {
  switch (condition) {
    case 'fast':
      return NETWORK_TIMEOUTS.FAST_API;
    case 'slow':
      return NETWORK_TIMEOUTS.SLOW_API;
    case 'normal':
    default:
      return NETWORK_TIMEOUTS.NORMAL_API;
  }
}

/**
 * Fetch with automatic retry on timeout (for unreliable connections)
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & { timeout?: number; retries?: number } = {}
): Promise<Response> {
  const { timeout = NETWORK_TIMEOUTS.NORMAL_API, retries = 2, ...fetchOptions } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError || new Error('Network request failed after retries');
}
