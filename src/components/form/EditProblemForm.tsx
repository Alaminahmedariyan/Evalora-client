"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";

import type { Difficulty, McqOptionInput, McqType, ProblemDetail, TestCaseInput } from "@/types";
import { useUpdateProblem } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { updateProblemFields } from "@/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormSection,
  McqOptionsEditor,
  SELECT_CLASS,
  TEXTAREA_CLASS,
  TestCasesEditor,
  type KeyedOption,
  type KeyedTestCase,
} from "./problem-form-parts";

export function EditProblemForm({ problem, onSaved }: { problem: ProblemDetail; onSaved: () => void }) {
  const updateMutation = useUpdateProblem(problem.id);
  const [formError, setFormError] = useState<string | null>(null);

  const mcqType: McqType = problem.mcqProblem?.type ?? "SINGLE_CHOICE";
  const [explanation, setExplanation] = useState(problem.mcqProblem?.explanation ?? "");

  const [options, setOptions] = useState<KeyedOption[]>(
    problem.mcqProblem?.options.map((option) => ({
      _key: option.id,
      optionText: option.optionText,
      isCorrect: option.isCorrect,
      order: option.order,
    })) ?? [],
  );

  const [testCases, setTestCases] = useState<KeyedTestCase[]>(
    problem.testCases.map((testCase) => ({
      _key: testCase.id,
      input: testCase.input ?? undefined,
      expectedOutput: testCase.expectedOutput,
      isSample: testCase.isSample,
      points: testCase.points,
      timeLimitMs: testCase.timeLimitMs ?? undefined,
      memoryLimitMb: testCase.memoryLimitMb ?? undefined,
    })),
  );

  const form = useForm({
    defaultValues: {
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      defaultMarks: problem.defaultMarks,
      isPublic: problem.isPublic,
      timeLimitSeconds: problem.timeLimitSeconds ?? 900,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      const cleanOptions: McqOptionInput[] = options.map(({ _key, ...option }) => option);
      const cleanTestCases: TestCaseInput[] = testCases.map(({ _key, ...testCase }) => testCase);

      const payload = {
        title: value.title,
        description: value.description,
        difficulty: value.difficulty,
        defaultMarks: value.defaultMarks,
        isPublic: value.isPublic,
        ...(problem.type === "MCQ" && {
          mcqType,
          explanation: explanation || undefined,
          options: cleanOptions,
        }),
        ...(problem.type === "CODING" && {
          timeLimitSeconds: value.timeLimitSeconds,
          testCases: cleanTestCases,
        }),
      };

      const parsed = updateProblemFields.safeParse(payload);

      if (!parsed.success) {
        setFormError(parsed.error.issues[0]?.message ?? "Please check the form for errors.");
        return;
      }

      try {
        await updateMutation.mutateAsync(payload);
        notify.success("Problem updated");
        onSaved();
      } catch (error) {
        const message = isApiError(error) ? error.message : "Couldn't update the problem.";

        setFormError(message);
        notify.error("Update failed", message);
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
      className="flex flex-col gap-5"
      noValidate
    >
      {formError ? (
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <FormSection title="Details">
        <form.Field name="title">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Title</Label>
              <Input id={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Description</Label>
              <textarea
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={5}
                className={TEXTAREA_CLASS}
              />
            </div>
          )}
        </form.Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="difficulty">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Difficulty</Label>
                <select
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as Difficulty)}
                  className={SELECT_CLASS}
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="defaultMarks">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Default marks</Label>
                <Input
                  id={field.name}
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="isPublic">
          {(field) => (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="size-4 rounded border-input"
              />
              Public problem
            </label>
          )}
        </form.Field>
      </FormSection>

      {problem.type === "MCQ" ? (
        <FormSection title="Answer options">
          <McqOptionsEditor options={options} mcqType={mcqType} onChange={setOptions} canResize={false} />

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Explanation</Label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              className={TEXTAREA_CLASS}
            />
          </div>
        </FormSection>
      ) : null}

      {problem.type === "CODING" ? (
        <FormSection title="Coding setup">
          <form.Field name="timeLimitSeconds">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Time limit (seconds)</Label>
                <Input
                  id={field.name}
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="max-w-[160px]"
                />
              </div>
            )}
          </form.Field>

          <TestCasesEditor testCases={testCases} onChange={setTestCases} />
        </FormSection>
      ) : null}

      <div className="flex gap-2">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" isLoading={isSubmitting}>
              Save changes
            </Button>
          )}
        </form.Subscribe>

        <Button type="button" variant="ghost" onClick={onSaved}>
          Cancel
        </Button>
      </div>
    </form>
  );
}