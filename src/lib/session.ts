import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_TOKEN_MAX_AGE_SECONDS } from "./constants";
import { serverEnv } from "./env";

const cookieOptions = {
  httpOnly: true,
  secure: serverEnv.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/**
 * Persist the session token in an httpOnly cookie so the proxy can verify
 * admin sessions server-side. The response is returned so callers can chain.
 */
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: AUTH_TOKEN_MAX_AGE_SECONDS,
  });
  return response;
}

/**
 * Expire the session cookie. Used by the logout endpoint.
 */
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...cookieOptions,
    maxAge: 0,
  });
  return response;
}
