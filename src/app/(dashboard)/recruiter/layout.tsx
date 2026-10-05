import type { ReactNode } from "react";

// The shell (sidebar, top bar) comes from the parent (dashboard) layout, and
// role access is enforced by middleware.ts, so this layout adds nothing.
export default function RecruiterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}