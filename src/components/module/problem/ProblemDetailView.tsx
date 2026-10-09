import { Check, Eye, EyeOff, Info } from "lucide-react";

import type { ProblemDetail } from "@/types";
import { cn } from "@/lib/utils";
import { ProblemTypeBadge } from "./ProblemTypeBadge";
import { DifficultyBadge } from "./DifficultyBadge";

function formatTimeLimit(seconds: number | null) {
  if (!seconds) return "—";
  return seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds} sec`;
}

export function ProblemDetailView({ problem }: { problem: ProblemDetail }) {
  const totalPoints = problem.testCases.reduce((sum, testCase) => sum + testCase.points, 0);
  const sampleCount = problem.testCases.filter((testCase) => testCase.isSample).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <ProblemTypeBadge type={problem.type} />
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className="stat-number rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {problem.defaultMarks} marks
        </span>
        {problem.isPublic ? (
          <span className="status-neutral rounded-full border px-2.5 py-1 text-xs font-medium">Public</span>
        ) : null}
      </div>

      <section className="card-evalora p-5 md:p-6">
        <h2 className="mb-2 text-sm font-semibold">Description</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{problem.description}</p>
      </section>

      {problem.type === "MCQ" && problem.mcqProblem ? (
        <section className="card-evalora flex flex-col gap-3 p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Options</h2>
            <span className="text-xs text-muted-foreground">
              {problem.mcqProblem.type === "SINGLE_CHOICE" ? "Single choice" : "Multiple choice"}
            </span>
          </div>

          {problem.mcqProblem.options.map((option, index) => (
            <div
              key={option.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
                option.isCorrect ? "border-success/40 bg-success/10" : "border-border",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  option.isCorrect
                    ? "border-success bg-success text-success-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {option.isCorrect ? <Check className="size-3.5" aria-hidden="true" /> : String.fromCharCode(65 + index)}
              </span>

              <span className="flex-1">{option.optionText}</span>

              {option.isCorrect ? <span className="text-xs font-medium text-success">Correct</span> : null}
            </div>
          ))}

          {problem.mcqProblem.explanation ? (
            <div className="mt-1 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <p className="whitespace-pre-wrap">{problem.mcqProblem.explanation}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {problem.type === "CODING" ? (
        <section className="card-evalora flex flex-col gap-4 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Test cases</h2>
            <p className="text-xs text-muted-foreground">
              Time limit {formatTimeLimit(problem.timeLimitSeconds)} · {problem.testCases.length} test case
              {problem.testCases.length === 1 ? "" : "s"} ({sampleCount} sample) · {totalPoints} points
            </p>
          </div>

          {problem.testCases.map((testCase, index) => (
            <div key={testCase.id} className="rounded-xl border border-border p-4 text-xs">
              <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                <span className="font-semibold">Test case {index + 1}</span>

                {testCase.isSample ? (
                  <span className="status-neutral inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
                    <Eye className="size-3" aria-hidden="true" />
                    Sample
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
                    <EyeOff className="size-3" aria-hidden="true" />
                    Hidden
                  </span>
                )}

                <span className="stat-number ml-auto">{testCase.points} pts</span>
              </div>

              <div className="grid gap-3 font-mono sm:grid-cols-2">
                <div>
                  <p className="mb-1 font-sans text-muted-foreground">Input</p>
                  <pre className="whitespace-pre-wrap rounded-md bg-muted/60 p-2">{testCase.input || "—"}</pre>
                </div>
                <div>
                  <p className="mb-1 font-sans text-muted-foreground">Expected output</p>
                  <pre className="whitespace-pre-wrap rounded-md bg-muted/60 p-2">{testCase.expectedOutput}</pre>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {problem.type === "WRITTEN" ? (
        <div className="flex items-start gap-2 rounded-xl border border-border p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Written answers are graded manually from the grading queue.
        </div>
      ) : null}
    </div>
  );
}