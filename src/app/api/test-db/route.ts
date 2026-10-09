import { withErrorHandling, ok } from "@/lib/api";
import { dbConnect } from "@/lib/db";

const READY_STATES: Record<number, string> = {
  0: "Disconnected",
  1: "Connected",
  2: "Connecting",
  3: "Disconnecting",
};

/**
 * GET /api/test-db
 * Health check that reports the current MongoDB connection state.
 */
export async function GET() {
  return withErrorHandling(async () => {
    const mongoose = await dbConnect();
    const readyState = mongoose.connection.readyState;

    if (readyState !== 1) {
      return ok(
        {
          status: "error",
          message: "Database did not reach connected state",
          database: READY_STATES[readyState] || "Unknown",
          readyState,
          timestamp: new Date().toISOString(),
        },
        503,
      );
    }

    return ok({
      status: "success",
      message: "Database connected!",
      database: READY_STATES[readyState] || "Unknown",
      readyState,
      timestamp: new Date().toISOString(),
    });
  });
}
