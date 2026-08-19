import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { ApiError } from "./api-error";
import { serverEnv } from "./env";

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: "admin" | "staff" | "customer";
  restaurantId?: string;
}

/**
 * Sign a JWT for an authenticated user.
 */
export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, serverEnv.JWT_SECRET, {
    expiresIn: serverEnv.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

/**
 * Verify and decode a JWT. Throws ApiError(401) when invalid/expired.
 */
export function verifyToken(token: string): AuthTokenPayload {
  try {
    return jwt.verify(token, serverEnv.JWT_SECRET) as AuthTokenPayload;
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
}

/**
 * Extract the bearer token from an Authorization header. Throws ApiError(401)
 * when the header is missing or malformed.
 */
export function getBearerToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }
  return authHeader.slice("Bearer ".length);
}

/**
 * Resolve the authenticated restaurant from the request. Throws on missing or
 * invalid credentials, or when the token carries no restaurant context.
 */
export function getAuthRestaurantId(request: NextRequest): string {
  const token = getBearerToken(request);
  const payload = verifyToken(token);

  if (!payload.restaurantId) {
    throw new ApiError(400, "Restaurant ID not found in token");
  }

  return payload.restaurantId;
}

/**
 * Resolve the full authenticated user context from the request.
 */
export function getAuthUser(request: NextRequest): AuthTokenPayload {
  const token = getBearerToken(request);
  return verifyToken(token);
}
