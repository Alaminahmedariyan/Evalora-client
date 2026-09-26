"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import type { AssessmentProblemInput, ProblemListItem } from "@/types";
import { useCreateAssessment } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { createAssessmentSchema, baseAssessmentFields } from "@/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProblemPicker } from "@/components/module/assessment";

interface SelectedProblem extends AssessmentProblemInput {
  title: string;
  type: ProblemListItem["type"];
  difficulty: ProblemListItem["difficulty"];
}

export function CreateAssessmentForm() {
  const router = useRouter();
  const createMutation = useCreateAssessment();
  const [formError, setFormError] = useState<string | null>(null);
  const [problems, setProblems] = useState<SelectedProblem[]>([]);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      durationMinutes: 60,
      passingMarks: 0,
      maxAttempts: 1,
      startAt: "",
      endAt: "",
      shuffleQuestions: false,
      showResultImmediately: false,
      allowReview: true,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      const totalMarks = problems.reduce((sum, p) => sum + p.marks, 0);
      const payload = {
        title: value.title,
        description: value.description || undefined,
        instructions: value.instructions || undefined,
        durationMinutes: value.durationMinutes,
        totalMarks,
        passingMarks: value.passingMarks,
        maxAttempts: value.maxAttempts,
        startAt: value.startAt || undefined,
        endAt: value.endAt || undefined,
        shuffleQuestions: value.shuffleQuestions,
        showResultImmediately: value.showResultImmediately,
        allowReview: value.allowReview,
        problems: problems.map(({ problemId, order, marks }) => ({ problemId, order, marks })),
      };

      const parsed = createAssessmentSchema.safeParse(payload);
      if (!parsed.success) {
        setFormError(parsed.error.issues[0]?.message ?? "Please check the form for errors.");
        return;
      }

      try {
        const res = await createMutation.mutateAsync(payload);
        notify.success("Assessment created", "It's saved as a draft — publish it when ready.");
        router.push(`/recruiter/assessments/${res.data.id}`);
      } catch (error) {
        const message = isApiError(error) ? error.message : "Couldn't create the assessment.";
        setFormError(message);
        notify.error("Creation failed", message);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-6"
      noValidate
    >
      {formError ? (
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <form.Field
        name="title"
        validators={{
          onBlur: ({ value }) => baseAssessmentFields.shape.title.safeParse(value).error?.issues[0]?.message,
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Title</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Junior Full-Stack Developer Assessment"
            />
            {field.state.meta.errors[0] ? (
              <p className="text-xs text-danger">{String(field.state.meta.errors[0])}</p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Description (optional)</Label>
            <textarea
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={2}
              className="interactive flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="instructions">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Instructions for candidates (optional)</Label>
            <textarea
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={2}
              className="interactive flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="You have 60 minutes. Do not switch tabs."
            />
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="durationMinutes">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Duration (minutes)</Label>
              <Input
                id={field.name}
                type="number"
                min={5}
                max={600}
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="maxAttempts">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Max attempts</Label>
              <Input
                id={field.name}
                type="number"
                min={1}
                max={10}
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="startAt">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Starts at (optional)</Label>
              <Input
                id={field.name}
                type="datetime-local"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="endAt">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Ends at (optional)</Label>
              <Input
                id={field.name}
                type="datetime-local"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Problems</Label>
        <ProblemPicker selected={problems} onChange={setProblems} />
      </div>

      <form.Field name="passingMarks">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Passing marks</Label>
            <Input
              id={field.name}
              type="number"
              min={0}
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              className="max-w-[160px]"
            />
            <p className="text-xs text-muted-foreground">
              Out of {problems.reduce((sum, p) => sum + p.marks, 0)} total marks
            </p>
          </div>
        )}
      </form.Field>

      <div className="flex flex-col gap-2">
        <form.Field name="shuffleQuestions">
          {(field) => (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} className="size-4 rounded border-input" />
              Shuffle question order per candidate
            </label>
          )}
        </form.Field>
        <form.Field name="showResultImmediately">
          {(field) => (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} className="size-4 rounded border-input" />
              Show result to candidate immediately after submission
            </label>
          )}
        </form.Field>
        <form.Field name="allowReview">
          {(field) => (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} className="size-4 rounded border-input" />
              Allow candidates to review answers before submitting
            </label>
          )}
        </form.Field>
      </div>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" isLoading={isSubmitting} className="self-start">
            Create assessment (draft)
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}