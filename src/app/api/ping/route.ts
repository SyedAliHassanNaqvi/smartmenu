import { ok } from "@/lib/api";

/**
 * GET /api/ping
 * Simple ping endpoint for network diagnostics.
 */
export async function GET() {
  return ok({ status: "ok", timestamp: Date.now() });
}
