import { withErrorHandling, ok } from "@/lib/api";
import { clearAuthCookie } from "@/lib/session";

/**
 * POST /api/auth/logout
 * Expire the httpOnly session cookie. Client state is cleared by the caller.
 */
export async function POST() {
  return withErrorHandling(async () => {
    return clearAuthCookie(ok({ success: true }));
  });
}
