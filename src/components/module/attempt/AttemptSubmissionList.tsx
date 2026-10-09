import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { AttemptDetail } from "@/types";
import { ProblemTypeBadge } from "@/components/module/problem/ProblemTypeBadge";

const SUBMISSION_STATUS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "status-neutral" },
  SUBMITTED: { label: "Submitted", className: "status-submitted" },
  EVALUATING: { label: "Needs grading", className: "status-pending" },
  EVALUATED: { label: "Graded", className: "status-evaluated" },
  FAILED: { label: "Failed", className: "status-failed" },
};

export function AttemptSubmissionList({ attempt }: { attempt: AttemptDetail }) {
  return (
    <div className="card-evalora flex flex-col divide-y divide-border overflow-hidden">
      {attempt.assessment.assessmentProblems.map((assessmentProblem) => {
        const { problem } = assessmentProblem;
        const submission = attempt.submissions.find((s) => s.problemId === problem.id);
        const status = submission ? SUBMISSION_STATUS[submission.status] : undefined;
        const canGrade = submission !== undefined && problem.type !== "MCQ";

        const row = (
          <div className="interactive flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent/50">
            <span className="stat-number w-5 shrink-0 text-xs text-muted-foreground">{assessmentProblem.order}</span>

            <p className="min-w-0 flex-1 truncate font-medium">{problem.title}</p>

            <ProblemTypeBadge type={problem.type} />

            <span className="stat-number hidden w-14 text-right text-xs text-muted-foreground sm:block">
              {assessmentProblem.marks} pts
            </span>

            {status ? (
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}>
                {status.label}
              </span>
            ) : (
              <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                No answer
              </span>
            )}

            {canGrade ? (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            ) : (
              <span className="w-4 shrink-0" />
            )}
          </div>
        );

        return (
          <div key={assessmentProblem.id}>
            {canGrade && submission ? <Link href={`/recruiter/evaluations/${submission.id}`}>{row}</Link> : row}
          </div>
        );
      })}
    </div>
  );
}