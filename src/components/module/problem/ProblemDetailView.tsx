import { CheckCircle2, Circle } from "lucide-react";

import type { ProblemDetail } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { ProblemTypeBadge } from "./ProblemTypeBadge";
import { DifficultyBadge } from "./DifficultyBadge";

export function ProblemDetailView({ problem }: { problem: ProblemDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <ProblemTypeBadge type={problem.type} />
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className="stat-number text-xs text-muted-foreground">{problem.defaultMarks} marks</span>
        {problem.isPublic ? (
          <span className="status-neutral rounded-full border px-2.5 py-1 text-xs font-medium">Public</span>
        ) : null}
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed">{problem.description}</p>

      {problem.type === "MCQ" && problem.mcqProblem ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <p className="text-xs font-medium text-muted-foreground">
              {problem.mcqProblem.type === "SINGLE_CHOICE" ? "Single choice" : "Multiple choice"}
            </p>
            {problem.mcqProblem.options.map((option) => (
              <div key={option.id} className="flex items-center gap-2 text-sm">
                {option.isCorrect ? (
                  <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                )}
                {option.optionText}
              </div>
            ))}
            {problem.mcqProblem.explanation ? (
              <p className="mt-2 border-t border-border pt-3 text-xs text-muted-foreground">
                {problem.mcqProblem.explanation}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {problem.type === "CODING" ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <p className="text-xs font-medium text-muted-foreground">
              Time limit: {problem.timeLimitSeconds ?? "—"} seconds · {problem.testCases.length} test case
              {problem.testCases.length === 1 ? "" : "s"}
            </p>
            {problem.testCases.map((tc, i) => (
              <div key={tc.id} className="rounded-md border border-border p-3 text-xs">
                <div className="mb-1.5 flex items-center gap-2 text-muted-foreground">
                  <span>Test case {i + 1}</span>
                  {tc.isSample ? <span className="status-neutral rounded-full border px-1.5 py-0.5">Sample</span> : null}
                  <span className="stat-number ml-auto">{tc.points} pts</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <p className="mb-1 text-muted-foreground">Input</p>
                    <pre className="whitespace-pre-wrap">{tc.input || "—"}</pre>
                  </div>
                  <div>
                    <p className="mb-1 text-muted-foreground">Expected output</p>
                    <pre className="whitespace-pre-wrap">{tc.expectedOutput}</pre>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}