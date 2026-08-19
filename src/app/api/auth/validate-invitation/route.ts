import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Invitation } from "@/lib/models/invitation.model";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * GET /api/auth/validate-invitation?token=UNIQUE_HASH_123
 * Validate an invitation token and return its details.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      throw new ApiError(400, "Invitation token is required");
    }

    await dbConnect();

    const invitation = await Invitation.findOne({
      invitationToken: token,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      throw new ApiError(404, "Invalid or expired invitation token");
    }

    return ok({
      valid: true,
      restaurantName: invitation.restaurantName,
      email: invitation.email,
      amount: invitation.amount,
      currency: invitation.currency,
    });
  });
}
