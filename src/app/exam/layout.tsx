import type { ReactNode } from "react";

// Deliberately minimal: no sidebar, no marketing header, no theme toggle —
// nothing that could distract from or interfere with a live proctored attempt.
// `exam-trust-zone` (globals.css) disables animations in this subtree and
// pins colors to the base theme. Access is already enforced by the API: only
// the attempt's owner (or its company) can load an attempt, otherwise the
// page shows "not found".
export default function ExamLayout({ children }: { children: ReactNode }) {
  return (
    <div className="exam-trust-zone flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}