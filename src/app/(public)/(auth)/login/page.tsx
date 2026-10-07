"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LoginForm } from "@/components/form/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      const role = (session.user as { role?: string }).role?.toUpperCase();
      if (role === "ADMIN") {
        router.replace("/admin");
      } else if (role === "RECRUITER") {
        router.replace("/recruiter");
      } else {
        router.replace("/candidate");
      }
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  return <LoginForm />;
}