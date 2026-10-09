import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./api-error";

/**
 * Successful JSON response helper.
 */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Consistent JSON error response helper.
 *
 * - `ApiError`  -> its status + message
 * - `ZodError`  -> 400 with validation details
 * - anything else -> 500 with a generic message (details logged server-side)
 */
export function fail(error: unknown, fallbackStatus = 500): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.flatten() },
      { status: 400 },
    );
  }

  if (typeof error === "string") {
    return NextResponse.json({ error }, { status: fallbackStatus });
  }

  console.error("[api] Unexpected error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: fallbackStatus });
}

/**
 * Wraps an async route handler so every thrown error is converted into a
 * consistent JSON response. Usage:
 *
 *   export async function GET(request: NextRequest) {
 *     return withErrorHandling(async () => {
 *       const products = await getProducts();
 *       return ok(products);
 *     });
 *   }
 */
export async function withErrorHandling(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    return fail(error);
  }
}
