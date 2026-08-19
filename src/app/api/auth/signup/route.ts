import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Invitation } from "@/lib/models/invitation.model";
import { Restaurant } from "@/lib/models/restaurant.model";
import { User } from "@/lib/models/user.model";
import { signupSchema } from "@/lib/validations/auth";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";

/**
 * POST /api/auth/signup
 * Create an admin account (and restaurant) using a valid invitation token.
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const { token, password, restaurantDetails } = signupSchema.parse(body);

    await dbConnect();

    const invitation = await Invitation.findOne({
      invitationToken: token,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      throw new ApiError(404, "Invalid or expired invitation token");
    }

    const restaurant = new Restaurant({
      name: invitation.restaurantName,
      ownerEmail: invitation.email,
      ownerName: restaurantDetails.ownerName,
      phone: restaurantDetails.phone,
      address: restaurantDetails.address,
      subscription: {
        plan: "basic",
        status: "active",
      },
      settings: {
        currency: invitation.currency,
        timezone: restaurantDetails.timezone,
        language: restaurantDetails.language,
      },
    });

    await restaurant.save();

    // Password is hashed by the User model's pre-save hook.
    const user = new User({
      email: invitation.email,
      password,
      name: restaurantDetails.ownerName,
      role: "admin",
      restaurantId: restaurant._id.toString(),
      isActive: true,
    });

    await user.save();

    invitation.status = "used";
    await invitation.save();

    return ok({
      success: true,
      restaurantId: restaurant._id.toString(),
      userId: user._id.toString(),
      message: "Restaurant and admin account created successfully",
    });
  });
}
