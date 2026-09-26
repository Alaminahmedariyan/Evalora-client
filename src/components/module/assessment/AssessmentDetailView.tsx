"use client";

import { useRouter } from "next/navigation";
import { Calendar, Clock, Repeat } from "lucide-react";

import type { AssessmentDetail } from "@/types";
import { useCloseAssessment, useDeleteAssessment, usePublishAssessment } from "@/hooks";
import { notify } from "@/lib/toast";
import { celebrate } from "@/lib/confetti";
import { isApiError } from "@/lib/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssessmentStatusBadge } from "./AssessmentStatusBadge";
import { ProblemTypeBadge } from "@/components/module/problem/ProblemTypeBadge";
import { DifficultyBadge } from "@/components/module/problem/DifficultyBadge";

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export function AssessmentDetailView({ assessment }: { assessment: AssessmentDetail }) {
  const router = useRouter();
  const publishMutation = usePublishAssessment();
  const closeMutation = useCloseAssessment();
  const deleteMutation = useDeleteAssessment();

  async function handlePublish() {
    try {
      await publishMutation.mutateAsync(assessment.id);
      celebrate();
      notify.success("Assessment published", "Candidates can now be invited.");
    } catch (error) {
      notify.error("Couldn't publish", isApiError(error) ? error.message : undefined);
    }
  }

  async function handleClose() {
    if (!window.confirm("Close this assessment? Candidates won't be able to start new attempts.")) return;
    try {
      await closeMutation.mutateAsync(assessment.id);
      notify.success("Assessment closed");
    } catch (error) {
      notify.error("Couldn't close", isApiError(error) ? error.message : undefined);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${assessment.title}"? This can't be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(assessment.id);
      notify.success("Assessment deleted");
      router.push("/recruiter/assessments");
    } catch (error) {
      notify.error("Couldn't delete", isApiError(error) ? error.message : undefined);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <AssessmentStatusBadge status={assessment.status} />
        {assessment.version > 1 ? (
          <span className="status-neutral rounded-full border px-2.5 py-1 text-xs font-medium">v{assessment.version}</span>
        ) : null}
      </div>

      {assessment.description ? <p className="text-sm text-muted-foreground">{assessment.description}</p> : null}

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-4" aria-hidden="true" />
          {assessment.durationMinutes} minutes
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Repeat className="size-4" aria-hidden="true" />
          {assessment.maxAttempts} attempt{assessment.maxAttempts === 1 ? "" : "s"}
        </div>
        {assessment.startAt ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4" aria-hidden="true" />
            {formatDate(assessment.startAt)}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {assessment.status === "DRAFT" ? (
          <Button onClick={handlePublish} isLoading={publishMutation.isPending}>
            Publish
          </Button>
        ) : null}
        {(assessment.status === "PUBLISHED" || assessment.status === "ACTIVE") ? (
          <Button variant="outline" onClick={handleClose} isLoading={closeMutation.isPending}>
            Close
          </Button>
        ) : null}
        {assessment.status === "DRAFT" ? (
          <Button variant="destructive" onClick={handleDelete} isLoading={deleteMutation.isPending}>
            Delete
          </Button>
        ) : null}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">
          Problems · {assessment.passingMarks}/{assessment.totalMarks} to pass
        </h2>
        <Card>
          <CardContent className="flex flex-col divide-y divide-border p-0">
            {assessment.assessmentProblems.map((ap) => (
              <div key={ap.id} className="flex items-center gap-3 px-4 py-3">
                <span className="stat-number w-5 shrink-0 text-xs text-muted-foreground">{ap.order}</span>
                <p className="flex-1 text-sm font-medium">{ap.problem.title}</p>
                <ProblemTypeBadge type={ap.problem.type} />
                <DifficultyBadge difficulty={ap.problem.difficulty} />
                <span className="stat-number w-12 text-right text-sm">{ap.marks}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}