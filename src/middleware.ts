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
      role = undefined;
    }
  }

  const isLoggedIn = Boolean(role);

  if (pathname === "/dashboard") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(new URL(dashboardPathFor(role), request.url));
  }

  if (isLoggedIn && AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL(dashboardPathFor(role), request.url));
  }

  if (PROTECTED_NO_ROLE_PATHS.some((path) => pathname.startsWith(path)) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const matchedPrefix = Object.keys(ROLE_BY_PREFIX).find((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (matchedPrefix) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (role !== ROLE_BY_PREFIX[matchedPrefix]) {
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
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