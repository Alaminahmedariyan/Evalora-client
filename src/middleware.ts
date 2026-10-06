import { NextRequest, NextResponse } from "next/server";

const AUTH_ONLY_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/two-factor"];

const PROTECTED_NO_ROLE_PATHS = ["/billing", "/settings"];

const ROLE_BY_PREFIX: Record<string, "ADMIN" | "RECRUITER" | "CANDIDATE"> = {
  "/admin": "ADMIN",
  "/recruiter": "RECRUITER",
  "/candidate": "CANDIDATE",
};

function dashboardPathFor(role?: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "RECRUITER") return "/recruiter";
  return "/candidate";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieHeader = request.headers.get("cookie") ?? "";

  const hasSessionCookie = cookieHeader.includes("better-auth.session_token");

  let role: string | undefined;

  // Only hit the backend when a session cookie is actually present.
  // Anonymous visitors should not cause an extra backend request.
  if (hasSessionCookie) {
    try {
      const backendUrl = process.env.BACKEND_URL ?? "http://localhost:5000";

      const res = await fetch(`${backendUrl}/api/v1/auth/me`, {
        headers: {
          cookie: cookieHeader,
          ...(process.env.INTERNAL_API_SECRET ? { "x-internal-secret": process.env.INTERNAL_API_SECRET } : {}),
        },
      });

      if (res.ok) {
        const json = (await res.json()) as {
          data?: {
            role?: string;
          };
        };

        role = json.data?.role;
      }
    } catch {
      // Treat a backend hiccup as "not logged in" for routing purposes.
      role = undefined;
    }
  }

  const isLoggedIn = Boolean(role);

  // Logged-in user hitting an auth-only page
  // → send to their own dashboard.
  if (isLoggedIn && AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL(dashboardPathFor(role), request.url));
  }

  // Protected paths that require authentication regardless
  // of role (e.g. /billing and /settings).
  if (PROTECTED_NO_ROLE_PATHS.some((path) => pathname.startsWith(path)) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Anonymous or wrong-role user hitting a role-scoped dashboard path.
  const matchedPrefix = Object.keys(ROLE_BY_PREFIX).find((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (matchedPrefix) {
    // Not logged in → login page.
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Logged in but wrong role → access denied.
    if (role !== ROLE_BY_PREFIX[matchedPrefix]) {
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/two-factor",
    "/billing",
    "/billing/:path*",
    "/settings",
    "/settings/:path*",
    "/admin",
    "/admin/:path*",
    "/recruiter",
    "/recruiter/:path*",
    "/candidate",
    "/candidate/:path*",
  ],
};
