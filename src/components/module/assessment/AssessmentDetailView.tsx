"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Eye, Pencil, Repeat } from "lucide-react";

import type { AssessmentDetail } from "@/types";
import { useCloseAssessment, useCreateAssessmentVersion, useDeleteAssessment, usePublishAssessment } from "@/hooks";
import { notify } from "@/lib/toast";
import { celebrate } from "@/lib/confetti";
import { isApiError } from "@/lib/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssessmentStatusBadge } from "./AssessmentStatusBadge";
import { VersionHistory } from "./VersionHistory";
import { ProblemTypeBadge } from "@/components/module/problem/ProblemTypeBadge";
import { DifficultyBadge } from "@/components/module/problem/DifficultyBadge";
import { InvitationList } from "@/components/module/invitation";
import { Leaderboard } from "@/components/module/result";
import { PendingQueue } from "@/components/module/evaluation";
import { InviteCandidatesForm, EditAssessmentForm } from "@/components/form";
import Link from "next/link";

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

const VISIBLE_TO_CANDIDATES = ["PUBLISHED", "ACTIVE"] as const;
const HAS_HISTORY_TO_SHOW = ["PUBLISHED", "ACTIVE", "CLOSED"] as const;

export function AssessmentDetailView({ assessment }: { assessment: AssessmentDetail }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const publishMutation = usePublishAssessment();
  const closeMutation = useCloseAssessment();
  const deleteMutation = useDeleteAssessment();
  const createVersionMutation = useCreateAssessmentVersion();

  const isOpenForInvites = (VISIBLE_TO_CANDIDATES as readonly string[]).includes(assessment.status);
  const hasHistoryToShow = (HAS_HISTORY_TO_SHOW as readonly string[]).includes(assessment.status);

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

  async function handleCreateVersion() {
    try {
      const res = await createVersionMutation.mutateAsync(assessment.id);
      notify.success("New draft version created");
      router.push(`/recruiter/assessments/${res.data.id}`);
    } catch (error) {
      notify.error("Couldn't create a new version", isApiError(error) ? error.message : undefined);
    }
  }

  if (editing) {
    return <EditAssessmentForm assessment={assessment} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline">
  <Link href={`/recruiter/assessments/${assessment.id}/preview`}>
    <Eye className="size-3.5" aria-hidden="true" />
    Preview
  </Link>
</Button>
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

      <div className="flex flex-wrap items-center gap-2">
        {assessment.status === "DRAFT" ? (
          <>
            <Button onClick={handlePublish} isLoading={publishMutation.isPending}>
              Publish
            </Button>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" aria-hidden="true" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete} isLoading={deleteMutation.isPending}>
              Delete
            </Button>
          </>
        ) : null}
        {assessment.status === "PUBLISHED" || assessment.status === "ACTIVE" ? (
          <Button variant="outline" onClick={handleClose} isLoading={closeMutation.isPending}>
            Close
          </Button>
        ) : null}
        {assessment.status !== "DRAFT" && assessment.isLatestVersion ? (
          <Button variant="outline" onClick={handleCreateVersion} isLoading={createVersionMutation.isPending}>
            Create new version
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

      {isOpenForInvites ? (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Invitations</h2>
            <InviteCandidatesForm assessmentId={assessment.id} />
          </div>
          <InvitationList assessmentId={assessment.id} />
        </div>
      ) : hasHistoryToShow ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold">Invitations</h2>
          <InvitationList assessmentId={assessment.id} />
        </div>
      ) : null}

      {hasHistoryToShow ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold">Leaderboard</h2>
          <Leaderboard assessmentId={assessment.id} />
        </div>
      ) : null}

      {hasHistoryToShow ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold">Grading queue</h2>
          <PendingQueue assessmentId={assessment.id} />
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 text-sm font-semibold">Version history</h2>
        <VersionHistory assessmentId={assessment.id} currentId={assessment.id} />
      </div>
    </div>
  );
}