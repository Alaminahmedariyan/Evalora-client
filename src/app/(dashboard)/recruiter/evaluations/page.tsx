import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

export default function EvaluationsLandingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Evaluations</h1>
        <p className="text-sm text-muted-foreground">
          Grading is done per-assessment — open an assessment to see its grading queue.
        </p>
      </div>
      <Link
        href="/recruiter/assessments"
        className="interactive card-evalora flex items-center gap-3 p-5 text-sm hover:bg-accent/50"
      >
        <ClipboardCheck className="size-5 text-primary" aria-hidden="true" />
        Go to Assessments
      </Link>
    </div>
  );
}