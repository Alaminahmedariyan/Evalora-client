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

const TEXTAREA_CLASS =
  "interactive flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in the user's own
// timezone, while the API stores a full timestamp.
function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";

  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
  const [startAt, setStartAt] = useState(toLocalInputValue(assessment.startAt));
  const [endAt, setEndAt] = useState(toLocalInputValue(assessment.endAt));
  const [shuffleQuestions, setShuffleQuestions] = useState(assessment.shuffleQuestions);
  const [showResultImmediately, setShowResultImmediately] = useState(assessment.showResultImmediately);
  const [allowReview, setAllowReview] = useState(assessment.allowReview);
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

  function validate(): string | null {
    if (title.trim().length < 3) return "Title must be at least 3 characters.";

    if (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 600) {
      return "Duration must be between 5 and 600 minutes.";
    }

    if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) {
      return "Max attempts must be between 1 and 10.";
    }

    if (problems.length === 0) return "Add at least one problem.";
    if (!Number.isInteger(passingMarks) || passingMarks < 0) return "Passing marks must be 0 or more.";
    if (passingMarks > totalMarks) return "Passing marks cannot exceed total marks.";

    if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
      return "The end time must be after the start time.";
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const problem = validate();

    if (problem) {
      setFormError(problem);
      return;
    }

    try {
      // Empty text and null dates are sent on purpose: they clear the saved value.
      await updateMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        durationMinutes,
        totalMarks,
        passingMarks,
        maxAttempts,
        startAt: startAt ? new Date(startAt).toISOString() : null,
        endAt: endAt ? new Date(endAt).toISOString() : null,
        shuffleQuestions,
        showResultImmediately,
        allowReview,
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
          className={TEXTAREA_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-instructions">Instructions for candidates</Label>
        <textarea
          id="edit-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={2}
          className={TEXTAREA_CLASS}
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

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-start">Starts at (optional)</Label>
          <Input
            id="edit-start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-end">Ends at (optional)</Label>
          <Input
            id="edit-end"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
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

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={shuffleQuestions}
            onChange={(e) => setShuffleQuestions(e.target.checked)}
            className="size-4 rounded border-input"
          />
          Shuffle question order per candidate
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showResultImmediately}
            onChange={(e) => setShowResultImmediately(e.target.checked)}
            className="size-4 rounded border-input"
          />
          Show result to candidate immediately after submission
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowReview}
            onChange={(e) => setAllowReview(e.target.checked)}
            className="size-4 rounded border-input"
          />
          Allow candidates to go back to earlier questions
        </label>
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