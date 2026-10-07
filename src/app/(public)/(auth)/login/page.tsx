"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMe } from "@/api";
import { dashboardPathFor } from "@/lib/dashboard-path";
import { LoginForm } from "@/components/form/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingSession() {
      try {
        // Same endpoint the route guards use, so this page and the
        // dashboards always agree on whether the user is signed in.
        const me = await getMe();

        if (!cancelled) {
          router.replace(dashboardPathFor(me.data.role));
        }

        // Keep the loading state while the redirect happens.
        return;
      } catch {
        // Not signed in (or the profile call failed): show the form.
      }

      if (!cancelled) {
        setCheckingAuth(false);
      }
    }

    void checkExistingSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return <LoginForm />;
}