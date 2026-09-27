"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import type { GradingSubmission } from "@/types";
import { useEvaluateSubmission } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { celebrate } from "@/lib/confetti";
import { manualEvaluationFields } from "@/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EvaluateSubmissionForm({ submission }: { submission: GradingSubmission }) {
  const router = useRouter();
  const evaluateMutation = useEvaluateSubmission();
  const [formError, setFormError] = useState<string | null>(null);

  const initialTestCaseResults = submission.problem.testCases.map((tc) => {
    const existing = submission.testCaseResults.find((r) => r.testCaseId === tc.id);
    return { testCaseId: tc.id, passed: existing?.passed ?? false, points: existing?.points ?? 0 };
  });
  const [testCaseResults, setTestCaseResults] = useState(initialTestCaseResults);

  const form = useForm({
    defaultValues: {
      score: submission.evaluation?.score ?? 0,
      feedback: submission.evaluation?.feedback ?? "",
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

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

      if (value.score > submission.problem.defaultMarks) {
        setFormError(`Score cannot exceed ${submission.problem.defaultMarks} marks.`);
        return;
      }

      try {
        await evaluateMutation.mutateAsync({ id: submission.id, payload });
        celebrate();
        notify.success("Submission graded");
        router.push(`/recruiter/evaluations`);
      } catch (error) {
        const message = isApiError(error) ? error.message : "Couldn't save this evaluation.";
        setFormError(message);
        notify.error("Grading failed", message);
      }
    },
  });

  function toggleTestCase(testCaseId: string, passed: boolean) {
    setTestCaseResults((prev) => prev.map((r) => (r.testCaseId === testCaseId ? { ...r, passed } : r)));
  }

  function updatePoints(testCaseId: string, points: number) {
    setTestCaseResults((prev) => prev.map((r) => (r.testCaseId === testCaseId ? { ...r, points } : r)));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-5"
      noValidate
    >
      {formError ? (
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      {submission.problem.type === "WRITTEN" ? (
        <div className="rounded-lg border border-border p-4 text-sm leading-relaxed">
          {submission.answerText || <span className="text-muted-foreground">No answer submitted.</span>}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="code-editor rounded-lg p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap">{submission.code || "No code submitted."}</pre>
          </div>
          {submission.language ? <p className="text-xs text-muted-foreground">Language: {submission.language}</p> : null}

          <div className="flex flex-col gap-2">
            <Label>Test cases</Label>
            {submission.problem.testCases.map((tc) => {
              const current = testCaseResults.find((r) => r.testCaseId === tc.id);
              return (
                <div key={tc.id} className="flex items-center gap-3 rounded-md border border-border p-3 text-xs">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={current?.passed ?? false}
                      onChange={(e) => toggleTestCase(tc.id, e.target.checked)}
                      className="size-3.5"
                    />
                    Passed
                  </label>
                  <span className="flex-1 truncate text-muted-foreground">{tc.isSample ? "Sample" : "Hidden"} test case</span>
                  <Input
                    type="number"
                    value={current?.points ?? 0}
                    onChange={(e) => updatePoints(tc.id, Number(e.target.value))}
                    className="h-8 w-20"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <form.Field name="score">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Score (out of {submission.problem.defaultMarks})</Label>
            <Input
              id={field.name}
              type="number"
              min={0}
              max={submission.problem.defaultMarks}
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              className="max-w-[160px]"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="feedback">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Feedback (optional)</Label>
            <textarea
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={3}
              className="interactive flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Notes for the candidate or your team..."
            />
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" isLoading={isSubmitting} className="self-start">
            Save evaluation
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}