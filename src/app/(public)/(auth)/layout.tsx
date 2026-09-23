import type { ReactNode } from "react";

// Login / Register / OTP / password-reset flows.
// TODO: if a session already exists, redirect away from here (e.g. to /candidate/dashboard
// or /recruiter/dashboard based on role) — check session in a server component or middleware.

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md card-evalora p-8">{children}</div>
    </main>
  );
}
