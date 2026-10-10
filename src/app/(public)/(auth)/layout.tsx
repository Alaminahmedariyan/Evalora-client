import type { ReactNode } from "react";

import RedirectIfAuthenticated from "@/components/module/auth/redirect-if-authenticated";

// Login / Register / OTP / password-reset flows. A signed-in user who opens
// the login or register page is sent to their own dashboard.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md card-evalora p-8">
        <RedirectIfAuthenticated>{children}</RedirectIfAuthenticated>
      </div>
    </main>
  );
}