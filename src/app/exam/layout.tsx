import type { ReactNode } from "react";

// Deliberately minimal: no sidebar, no marketing header, no theme-toggle —
// nothing that could distract from or interfere with a live proctored attempt.
// `exam-trust-zone` (globals.css) disables animations in this subtree and pins
// colors to the base theme so nothing here looks "off" mid-exam.
//
// TODO: guard this route — require an active AssessmentAttempt (status
// IN_PROGRESS) owned by the logged-in candidate, matching the [attemptId]
// param, or redirect to /candidate/invitations. Also wire up the
// tab-switch / fullscreen-exit / devtools listeners here (see
// ProctoringEventType in schema.prisma) since this is the one layout where
// they should run.

export default function ExamLayout({ children }: { children: ReactNode }) {
  return (
    <div className="exam-trust-zone min-h-screen flex flex-col">
      <header className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0">
        {/* TODO: assessment title, countdown timer (timer-normal/warning/critical classes), submit button */}
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
