"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type { AssessmentDetail, AssessmentProblemInput, ProblemListItem } from "@/types";
import { useUpdateAssessment } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProblemPicker } from "@/components/module/assessment";

interface SelectedProblem extends AssessmentProblemInput {
  title: string;
  type: ProblemListItem["type"];
  difficulty: ProblemListItem["difficulty"];
}

export function EditAssessmentForm({
  assessment,
  onSaved,
  onCancel,
}: {
  assessment: AssessmentDetail;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const updateMutation = useUpdateAssessment(assessment.id);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState(assessment.title);
  const [description, setDescription] = useState(assessment.description ?? "");
  const [instructions, setInstructions] = useState(assessment.instructions ?? "");
  const [durationMinutes, setDurationMinutes] = useState(assessment.durationMinutes);
  const [passingMarks, setPassingMarks] = useState(assessment.passingMarks);
  const [maxAttempts, setMaxAttempts] = useState(assessment.maxAttempts);
  const [problems, setProblems] = useState<SelectedProblem[]>(
    assessment.assessmentProblems.map((ap) => ({
      problemId: ap.problem.id,
      order: ap.order,
      marks: ap.marks,
      title: ap.problem.title,
      type: ap.problem.type,
      difficulty: ap.problem.difficulty,
    })),
  );

  const totalMarks = problems.reduce((sum, p) => sum + p.marks, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (problems.length === 0) {
      setFormError("Add at least one problem.");
      return;
    }
    if (passingMarks > totalMarks) {
      setFormError("Passing marks cannot exceed total marks.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        title,
        description: description || undefined,
        instructions: instructions || undefined,
        durationMinutes,
        totalMarks,
        passingMarks,
        maxAttempts,
        problems: problems.map(({ problemId, order, marks }) => ({ problemId, order, marks })),
      });
      notify.success("Assessment updated");
      onSaved();
    } catch (error) {
      const message = isApiError(error) ? error.message : "Couldn't update the assessment.";
      setFormError(message);
      notify.error("Update failed", message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit assessment</h1>
        <button
          type="button"
          onClick={onCancel}
          className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-accent"
          aria-label="Cancel editing"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {formError ? (
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-title">Title</Label>
        <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-description">Description</Label>
        <textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="interactive flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-instructions">Instructions</Label>
        <textarea
          id="edit-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={2}
          className="interactive flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-duration">Duration (minutes)</Label>
          <Input
            id="edit-duration"
            type="number"
            min={5}
            max={600}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-max-attempts">Max attempts</Label>
          <Input
            id="edit-max-attempts"
            type="number"
            min={1}
            max={10}
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Problems</Label>
        <ProblemPicker selected={problems} onChange={setProblems} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-passing-marks">Passing marks</Label>
        <Input
          id="edit-passing-marks"
          type="number"
          min={0}
          value={passingMarks}
          onChange={(e) => setPassingMarks(Number(e.target.value))}
          className="max-w-[160px]"
        />
        <p className="text-xs text-muted-foreground">Out of {totalMarks} total marks</p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" isLoading={updateMutation.isPending}>
          Save changes
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}