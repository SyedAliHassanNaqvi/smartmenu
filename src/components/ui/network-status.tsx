'use client';

import { useEffect, useState } from 'react';
import { measureNetworkLatency, type NetworkDiagnostics } from '@/lib/network-utils';

export function NetworkStatus() {
  const [diagnostics, setDiagnostics] = useState<NetworkDiagnostics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show for slow connections
    const checkConnection = async () => {
      const diag = await measureNetworkLatency();
      setDiagnostics(diag);
      
      if (diag.isSlowConnection) {
        setIsVisible(true);
      }
    };

    checkConnection();
    
    // Check again every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !diagnostics) return null;

  const getStatusColor = () => {
    if (diagnostics.latency < 500) return 'bg-green-100 border-green-300 text-green-800';
    if (diagnostics.latency < 1500) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  const getStatusText = () => {
    if (diagnostics.latency < 500) return '✓ Good connection';
    if (diagnostics.latency < 1500) return '⚠ Moderate connection';
    return '⚠ Slow connection - requests may take longer';
  };

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded border text-sm max-w-xs ${getStatusColor()}`}
    >
      <div className="font-semibold">{getStatusText()}</div>
      <div className="text-xs mt-1">
        Latency: {diagnostics.latency}ms
        {diagnostics.effectiveType && ` • ${diagnostics.effectiveType}`}
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-xs mt-2 underline hover:opacity-75"
      >
        Dismiss
      </button>
    </div>
  );
}
