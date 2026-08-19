import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models/user.model";
import { verifyToken } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";
import { setAuthCookie } from "@/lib/session";

/**
 * GET /api/auth/verify
 * Verify a JWT and return fresh user data. Also refreshes the session cookie.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "No token provided");
    }

    const token = authHeader.slice("Bearer ".length);
    const decoded = verifyToken(token);

    await dbConnect();

    const user = await User.findById(decoded.userId).select("-password");
    if (!user || !user.isActive) {
      throw new ApiError(401, "User not found or inactive");
    }

    const response = ok({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
      },
    });

    return setAuthCookie(response, token);
  });
}
