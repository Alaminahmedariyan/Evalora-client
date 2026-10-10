"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { useGetMe } from "@/hooks";
import { dashboardPathFor } from "@/lib/dashboard-path";
import AuthLoading from "./auth-loading";

// Only these pages bounce a signed-in user away. The verification,
// two-factor and reset flows must stay reachable, because a session can
// exist there before the flow is finished.
const REDIRECT_FROM = ["/login", "/register", "/forgot-password"];

export default function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useGetMe();
  const user = data?.data;

  const shouldRedirect = Boolean(user?.emailVerified) && REDIRECT_FROM.includes(pathname);

  useEffect(() => {
    if (shouldRedirect && user) {
      router.replace(dashboardPathFor(user.role));
    }
  }, [shouldRedirect, user, router]);

  if (shouldRedirect) {
    return <AuthLoading label="You're already signed in. Redirecting..." />;
  }

  return <>{children}</>;
}