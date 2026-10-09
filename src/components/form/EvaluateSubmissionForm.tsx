"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { ArrowRight, Check, Copy, Info } from "lucide-react";

import type { GradingSubmission } from "@/types";
import { useEvaluateSubmission } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { celebrate } from "@/lib/confetti";
import { cn } from "@/lib/utils";
import { manualEvaluationFields } from "@/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEXTAREA_CLASS } from "./problem-form-parts";

const FEEDBACK_TEMPLATES = [
  "Great work, well explained.",
  "Correct approach with minor issues.",
  "Partially correct. Some cases are missing.",
  "Incorrect, please review the expected output.",
];

export type GradingQueue = {
  // True once this assessment's list of pending submissions has loaded.
  ready: boolean;
  // The oldest other submission still waiting for a grade, if any.
  nextSubmissionId: string | null;
};

type SaveAction = "list" | "next";

export function EvaluateSubmissionForm({
  submission,
  queue,
}: {
  submission: GradingSubmission;
  queue?: GradingQueue;
}) {
  const router = useRouter();
  const evaluateMutation = useEvaluateSubmission();
  const [formError, setFormError] = useState<string | null>(null);

  // The ref decides what happens after saving; the state only drives which
  // button shows its spinner.
  const afterSaveRef = useRef<SaveAction>("list");
  const [activeAction, setActiveAction] = useState<SaveAction>("list");

  const nextSubmissionId = queue?.nextSubmissionId ?? null;
  const hasNext = nextSubmissionId !== null;
  const assessmentId = submission.attempt?.assessmentId;

  // The backend scores against the marks set in the assessment, which is
  // stored on the evaluation. defaultMarks is only a fallback.
  const maxMarks = submission.evaluation?.maxScore ?? submission.problem.defaultMarks;

  const [testCaseResults, setTestCaseResults] = useState(
    submission.problem.testCases.map((tc) => {
      const existing = submission.testCaseResults.find((r) => r.testCaseId === tc.id);
      return { testCaseId: tc.id, passed: existing?.passed ?? false, points: existing?.points ?? 0 };
    }),
  );

  const form = useForm({
    defaultValues: {
      score: submission.evaluation?.score ?? 0,
      feedback: submission.evaluation?.feedback ?? "",
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      const action = afterSaveRef.current;
      afterSaveRef.current = "list";

      const payload = {
        score: value.score,
        feedback: value.feedback || undefined,
        ...(submission.problem.type === "CODING" && { testCaseResults }),
      };

      const parsed = manualEvaluationFields.safeParse(payload);
      if (!parsed.success) {
        setFormError(parsed.error.issues[0]?.message ?? "Please check the form for errors.");
        return;
      }

      if (value.score > maxMarks) {
        setFormError(`Score cannot exceed ${maxMarks} marks.`);
        return;
      }

      try {
        await evaluateMutation.mutateAsync({ id: submission.id, payload });
      } catch (error) {
        const message = isApiError(error) ? error.message : "Couldn't save this evaluation.";
        setFormError(message);
        notify.error("Grading failed", message);
        return;
      }

      if (action === "next" && nextSubmissionId) {
        notify.success("Submission graded", "Opening the next one.");
        router.push(`/recruiter/evaluations/${nextSubmissionId}`);
        return;
      }

      // Nothing else is waiting in this assessment: the grading is finished.
      if (queue?.ready && !nextSubmissionId && assessmentId) {
        celebrate();
        notify.success("All submissions graded", "Results are updated for this assessment.");
        router.push(`/recruiter/assessments/${assessmentId}`);
        return;
      }

      notify.success("Submission graded");
      router.push("/recruiter/evaluations");
    },
  });

  function save(action: SaveAction) {
    afterSaveRef.current = action;
    setActiveAction(action);
    void form.handleSubmit();
  }

  function toggleTestCase(testCaseId: string, defaultPoints: number, passed: boolean) {
    setTestCaseResults((previous) =>
      previous.map((r) =>
        r.testCaseId === testCaseId ? { ...r, passed, points: passed ? defaultPoints : 0 } : r,
      ),
    );
  }

  function updatePoints(testCaseId: string, points: number) {
    setTestCaseResults((previous) =>
      previous.map((r) => (r.testCaseId === testCaseId ? { ...r, points } : r)),
    );
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(submission.code ?? "");
      notify.success("Code copied");
    } catch {
      notify.error("Couldn't copy the code");
    }
  }

  // MCQ answers are graded automatically; the backend refuses manual grades.
  if (submission.problem.type === "MCQ") {
    return (
      <div className="card-evalora flex flex-col gap-3 p-5 md:p-6">
        <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          MCQ answers are graded automatically when the attempt is submitted, so there is nothing to grade here.
        </div>

        {submission.answers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No option was selected.</p>
        ) : (
          submission.answers.map((answer) => (
            <div
              key={answer.optionId}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                answer.option.isCorrect ? "border-success/40 bg-success/10" : "border-danger/30 bg-danger/5",
              )}
            >
              {answer.option.optionText}
              <span className="ml-auto text-xs text-muted-foreground">
                {answer.option.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
          ))
        )}
      </div>
    );
  }

  const isCoding = submission.problem.type === "CODING";
  const testCaseTotal = testCaseResults.filter((r) => r.passed).reduce((sum, r) => sum + r.points, 0);
  const alreadyGraded = submission.evaluation?.status === "COMPLETED";

  const quickScores = [
    { label: "0", value: 0 },
    { label: "Half", value: Math.round(maxMarks / 2) },
    { label: "Full", value: maxMarks },
  ];

  const answerText = submission.answerText ?? "";
  const words = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Pressing Enter in the score box keeps the grader moving.
        save(hasNext ? "next" : "list");
      }}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
      noValidate
    >
      <div className="flex min-w-0 flex-col gap-4">
        {isCoding ? (
          <div className="code-editor overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
              <span className="text-xs text-slate-400">{submission.language ?? "Language not recorded"}</span>

              <button
                type="button"
                onClick={() => void copyCode()}
                disabled={!submission.code}
                className="interactive inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-40"
              >
                <Copy className="size-3.5" aria-hidden="true" />
                Copy
              </button>
            </div>

            <pre className="max-h-[32rem] overflow-auto whitespace-pre p-4 font-mono text-sm leading-6">
              {submission.code || "No code submitted."}
            </pre>
          </div>
        ) : (
          <div className="card-evalora flex flex-col gap-3 p-5 md:p-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold">Candidate&apos;s answer</span>
              <span>
                {words} word{words === 1 ? "" : "s"}
              </span>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {answerText || <span className="text-muted-foreground">No answer submitted.</span>}
            </p>
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        {formError ? (
          <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
            {formError}
          </div>
        ) : null}

        {alreadyGraded && submission.evaluation ? (
          <div className="flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs">
            <Info className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <p>
              Already graded {submission.evaluation.score}/{submission.evaluation.maxScore}. Saving replaces that
              grade.
            </p>
          </div>
        ) : null}

        <div className="card-evalora flex flex-col gap-4 p-5">
          <form.Field name="score">
            {(field) => (
              <div className="flex flex-col gap-3">
                <div className="flex items-end justify-between">
                  <Label htmlFor={field.name}>Score</Label>
                  <span className="stat-number text-2xl font-semibold">
                    {field.state.value}
                    <span className="text-sm font-normal text-muted-foreground">/{maxMarks}</span>
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={maxMarks}
                  step={1}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  aria-label="Score slider"
                  className="w-full accent-[var(--primary)]"
                />

                <div className="flex flex-wrap items-center gap-2">
                  {quickScores.map((quick) => (
                    <Button
                      key={quick.label}
                      type="button"
                      size="sm"
                      variant={field.state.value === quick.value ? "default" : "outline"}
                      onClick={() => field.handleChange(quick.value)}
                    >
                      {quick.label}
                    </Button>
                  ))}

                  <Input
                    id={field.name}
                    type="number"
                    min={0}
                    max={maxMarks}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="h-9 w-20"
                  />
                </div>

                {isCoding && testCaseTotal > 0 ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="self-start"
                    onClick={() => field.handleChange(Math.min(testCaseTotal, maxMarks))}
                  >
                    Use passed test cases ({testCaseTotal} pts)
                  </Button>
                ) : null}
              </div>
            )}
          </form.Field>
        </div>

        {isCoding ? (
          <div className="card-evalora flex flex-col gap-3 p-5">
            <Label>Test cases</Label>

            {submission.problem.testCases.map((tc, index) => {
              const current = testCaseResults.find((r) => r.testCaseId === tc.id);
              const passed = current?.passed ?? false;

              return (
                <div key={tc.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={passed}
                      aria-label={`Test case ${index + 1} passed`}
                      onClick={() => toggleTestCase(tc.id, tc.points, !passed)}
                      className={cn(
                        "interactive flex size-6 shrink-0 items-center justify-center rounded-md border",
                        passed
                          ? "border-success bg-success text-success-foreground"
                          : "border-border text-transparent hover:border-success/60",
                      )}
                    >
                      <Check className="size-3.5" aria-hidden="true" />
                    </button>

                    <span className="flex-1 font-medium">
                      {tc.isSample ? "Sample" : "Hidden"} #{index + 1}
                    </span>

                    <Input
                      type="number"
                      min={0}
                      value={current?.points ?? 0}
                      onChange={(e) => updatePoints(tc.id, Number(e.target.value))}
                      aria-label={`Points for test case ${index + 1}`}
                      className="h-8 w-16 text-xs"
                    />
                  </div>

                  <details className="text-muted-foreground">
                    <summary className="cursor-pointer select-none">Input and expected output</summary>
                    <div className="mt-2 grid gap-2 font-mono">
                      <pre className="whitespace-pre-wrap rounded-md bg-muted/60 p-2">{tc.input || "—"}</pre>
                      <pre className="whitespace-pre-wrap rounded-md bg-muted/60 p-2">{tc.expectedOutput}</pre>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="card-evalora flex flex-col gap-3 p-5">
          <form.Field name="feedback">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={field.name}>Feedback (optional)</Label>

                <textarea
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={4}
                  className={TEXTAREA_CLASS}
                  placeholder="Notes for the candidate or your team..."
                />

                <div className="flex flex-wrap gap-1.5">
                  {FEEDBACK_TEMPLATES.map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() =>
                        field.handleChange(field.state.value ? `${field.state.value} ${template}` : template)
                      }
                      className="interactive rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <div className="flex flex-col gap-2">
              {hasNext ? (
                <>
                  <Button
                    type="button"
                    size="lg"
                    disabled={isSubmitting}
                    isLoading={isSubmitting && activeAction === "next"}
                    onClick={() => save("next")}
                  >
                    Save &amp; next
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    isLoading={isSubmitting && activeAction === "list"}
                    onClick={() => save("list")}
                  >
                    Save and go to queue
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  onClick={() => save("list")}
                >
                  Save evaluation
                </Button>
              )}
            </div>
          )}
        </form.Subscribe>
      </aside>
    </form>
  );
}