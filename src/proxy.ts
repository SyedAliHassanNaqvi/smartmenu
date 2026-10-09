import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

/**
 * Optimistic route protection for admin-only pages.
 *
 * The JWT is stored both in zustand (localStorage) and in an httpOnly cookie
 * set by the auth API routes, so this proxy can verify sessions server-side
 * before the client-side guard in `src/app/admin/layout.tsx` even runs.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/admin") && !pathname.startsWith("/api");

  if (isProtectedRoute && !hasValidToken(request)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

function hasValidToken(request: NextRequest): boolean {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) return false;

  try {
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
