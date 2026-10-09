import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Invitation } from "@/lib/models/invitation.model";
import { Restaurant } from "@/lib/models/restaurant.model";
import { User } from "@/lib/models/user.model";
import { signupSchema } from "@/lib/validations/auth";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";
import { getPlan } from "@/config/plans";

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

    if (await User.exists({ email: invitation.email })) {
      throw new ApiError(409, "An account with this email already exists. Please sign in instead.");
    }

    const plan = getPlan(invitation.plan) ?? getPlan("starter")!;

    const restaurant = new Restaurant({
      name: invitation.restaurantName,
      ownerEmail: invitation.email,
      ownerName: restaurantDetails.ownerName,
      phone: restaurantDetails.phone,
      address: restaurantDetails.address,
      subscription: {
        plan: plan.id,
        status: "active",
        expiresAt: new Date(Date.now() + plan.periodDays * 24 * 60 * 60 * 1000),
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

    try {
      await user.save();
    } catch (error) {
      // Don't leave an orphaned restaurant behind if the account can't be created.
      await Restaurant.deleteOne({ _id: restaurant._id });
      throw error;
    }

    invitation.status = "used";
    invitation.usedAt = new Date();
    invitation.restaurantId = restaurant._id.toString();
    await invitation.save();

    return ok({
      success: true,
      restaurantId: restaurant._id.toString(),
      userId: user._id.toString(),
      message: "Restaurant and admin account created successfully",
    });
  });
}
