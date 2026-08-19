import type { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models/user.model";
import { loginSchema } from "@/lib/validations/auth";
import { signToken } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { withErrorHandling, ok } from "@/lib/api";
import { setAuthCookie } from "@/lib/session";

/**
 * POST /api/auth/login
 * Authenticate a user and issue a JWT (returned in the body and set as an
 * httpOnly cookie for the proxy).
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    await dbConnect();

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new ApiError(401, "Invalid credentials");
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      restaurantId: user.restaurantId,
      role: user.role,
    });

    const response = ok(
      {
        success: true,
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId,
        },
      },
      200,
    );

    return setAuthCookie(response, token);
  });
}
