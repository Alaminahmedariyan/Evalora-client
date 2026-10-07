"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LoginForm } from "@/components/form/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const { data: session } = await authClient.getSession();

        if (session?.user) {
          const role = (session.user as { role?: string }).role?.toUpperCase();

          if (role === "ADMIN") {
            router.replace("/admin");
          } else if (role === "RECRUITER") {
            router.replace("/recruiter");
          } else {
            router.replace("/candidate");
          }
          return;
        }
      } catch {
        // Session not found or error occurred
      } finally {
        setCheckingAuth(false);
      }
    }

    void checkExistingSession();
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