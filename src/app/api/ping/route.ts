import { NextResponse } from 'next/server';

/**
 * GET /api/ping
 * Simple ping endpoint for network diagnostics
 */
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: Date.now() });
}