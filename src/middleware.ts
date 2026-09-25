import { NextRequest, NextResponse } from "next/server";

const AUTH_ONLY_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/two-factor",
];

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

  // Only hit the backend when a session cookie is actually present — an
  // anonymous visitor shouldn't cost an extra network round trip per nav.
  if (hasSessionCookie) {
    try {
      const authBaseUrl = process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? "http://localhost:5000";
      const res = await fetch(`${authBaseUrl}/api/v1/auth/me`, {
        headers: { cookie: cookieHeader },
      });
      if (res.ok) {
        const json = (await res.json()) as { data?: { role?: string } };
        role = json?.data?.role;
      }
    } catch {
      role = undefined; // treat a backend hiccup as "not logged in" for routing purposes
    }
  }

  const isLoggedIn = Boolean(role);

  // Logged-in user hitting "/" or any auth-only page → send to their own dashboard
if (isLoggedIn && AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
  return NextResponse.redirect(new URL(dashboardPathFor(role), request.url));
}

  // Anonymous or wrong-role user hitting a role-scoped dashboard path
  const matchedPrefix = Object.keys(ROLE_BY_PREFIX).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
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
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/two-factor",
    "/admin",
    "/admin/:path*",
    "/recruiter",
    "/recruiter/:path*",
    "/candidate",
    "/candidate/:path*",
  ],
};