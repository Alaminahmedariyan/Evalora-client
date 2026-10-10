"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Eye, EyeOff, Pencil, Repeat } from "lucide-react";
import Link from "next/link";

import type { AssessmentDetail } from "@/types";
import {
  useCloseAssessment,
  useCreateAssessmentVersion,
  useDeleteAssessment,
  useMyCompany,
  usePublishAssessment,
  useReleaseResults,
} from "@/hooks";
import { notify } from "@/lib/toast";
import { celebrate } from "@/lib/confetti";
import { isApiError } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AssessmentStatusBadge } from "./AssessmentStatusBadge";
import { VersionHistory } from "./VersionHistory";
import { ProblemTypeBadge } from "@/components/module/problem/ProblemTypeBadge";
import { DifficultyBadge } from "@/components/module/problem/DifficultyBadge";
import { InvitationList } from "@/components/module/invitation";
import { Leaderboard } from "@/components/module/result";
import { PendingQueue } from "@/components/module/evaluation";
import { InviteCandidatesForm, EditAssessmentForm } from "@/components/form";
import { CompanyVerificationBanner } from "@/components/module/company/CompanyVerificationBanner";

function formatDate(value: string | null) {
  if (!value) return null;

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const VISIBLE_TO_CANDIDATES = ["PUBLISHED", "ACTIVE"] as const;
const HAS_HISTORY_TO_SHOW = ["PUBLISHED", "ACTIVE", "CLOSED"] as const;
const RESULTS_RELEASED_BY_STATUS = ["CLOSED", "ARCHIVED"] as const;

export function AssessmentDetailView({
  assessment,
}: {
  assessment: AssessmentDetail;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);

  const publishMutation = usePublishAssessment();
  const closeMutation = useCloseAssessment();
  const deleteMutation = useDeleteAssessment();
  const createVersionMutation = useCreateAssessmentVersion();
  const releaseMutation = useReleaseResults(assessment.id);

  const { data: companyRes } = useMyCompany();
  const companyUnverified = companyRes?.data ? !companyRes.data.isVerified : false;

  const isOpenForInvites = (
    VISIBLE_TO_CANDIDATES as readonly string[]
  ).includes(assessment.status);

  const hasHistoryToShow = (
    HAS_HISTORY_TO_SHOW as readonly string[]
  ).includes(assessment.status);

  // Mirrors the backend rule: candidates see results once the recruiter
  // releases them, or once the assessment is closed.
  const resultsReleased =
    assessment.showResultImmediately ||
    (RESULTS_RELEASED_BY_STATUS as readonly string[]).includes(assessment.status);

  async function handlePublish() {
    try {
      await publishMutation.mutateAsync(assessment.id);
      celebrate();
      notify.success("Assessment published", "Candidates can now be invited.");
    } catch (error) {
      notify.error(
        "Couldn't publish",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  async function handleClose() {
    try {
      await closeMutation.mutateAsync(assessment.id);
      setCloseOpen(false);
      notify.success(
        "Assessment closed",
        assessment.showResultImmediately
          ? undefined
          : "Results are now released and candidates have been notified.",
      );
    } catch (error) {
      notify.error(
        "Couldn't close",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  async function handleRelease() {
    try {
      const res = await releaseMutation.mutateAsync();
      const { notified, waitingForGrading } = res.data;

      notify.success(
        "Results released",
        `${notified} candidate${notified === 1 ? "" : "s"} notified.${
          waitingForGrading > 0
            ? ` ${waitingForGrading} more will be notified when their grading finishes.`
            : ""
        }`,
      );
    } catch (error) {
      notify.error(
        "Couldn't release results",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(assessment.id);
      notify.success("Assessment deleted");
      router.push("/recruiter/assessments");
    } catch (error) {
      notify.error(
        "Couldn't delete",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  async function handleCreateVersion() {
    try {
      const res = await createVersionMutation.mutateAsync(assessment.id);
      notify.success("New draft version created");
      router.push(`/recruiter/assessments/${res.data.id}`);
    } catch (error) {
      notify.error(
        "Couldn't create a new version",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  if (editing) {
    return (
      <EditAssessmentForm
        assessment={assessment}
        onSaved={() => setEditing(false)}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CompanyVerificationBanner />

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline">
          <Link href={`/recruiter/assessments/${assessment.id}/preview`}>
            <Eye className="size-3.5" aria-hidden="true" />
            Preview
          </Link>
        </Button>

        <AssessmentStatusBadge status={assessment.status} />

        {assessment.version > 1 ? (
          <span className="status-neutral rounded-full border px-2.5 py-1 text-xs font-medium">
            v{assessment.version}
          </span>
        ) : null}
      </div>

      {assessment.description ? (
        <p className="text-sm text-muted-foreground">
          {assessment.description}
        </p>
      ) : null}

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-4" aria-hidden="true" />
          {assessment.durationMinutes} minutes
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Repeat className="size-4" aria-hidden="true" />
          {assessment.maxAttempts} attempt
          {assessment.maxAttempts === 1 ? "" : "s"}
        </div>

        {assessment.startAt ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4" aria-hidden="true" />
            {formatDate(assessment.startAt)}
          </div>
        ) : null}
      </div>

      {assessment.status !== "DRAFT" ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              resultsReleased
                ? "bg-success/10 text-success"
                : "bg-warning/10 text-warning",
            )}
          >
            {resultsReleased ? (
              <Eye className="size-4" aria-hidden="true" />
            ) : (
              <EyeOff className="size-4" aria-hidden="true" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {resultsReleased
                ? "Results are visible to candidates"
                : "Results are hidden from candidates"}
            </p>

            <p className="text-xs text-muted-foreground">
              {resultsReleased
                ? assessment.showResultImmediately
                  ? "Each candidate sees their result as soon as it is graded."
                  : "This assessment is closed, so candidates can see their results."
                : "Candidates see their results after you release them, or when you close the assessment."}
            </p>
          </div>

          {!resultsReleased ? (
            <Button
              size="sm"
              onClick={() => setReleaseOpen(true)}
              isLoading={releaseMutation.isPending}
            >
              Release results
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {assessment.status === "DRAFT" ? (
          <>
            <Button
              onClick={handlePublish}
              isLoading={publishMutation.isPending}
              disabled={companyUnverified}
            >
              Publish
            </Button>

            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" aria-hidden="true" />
              Edit
            </Button>

            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </>
        ) : null}

        {assessment.status === "PUBLISHED" ||
        assessment.status === "ACTIVE" ? (
          <Button
            variant="outline"
            onClick={() => setCloseOpen(true)}
            isLoading={closeMutation.isPending}
          >
            Close
          </Button>
        ) : null}

        {assessment.status !== "DRAFT" && assessment.isLatestVersion ? (
          <Button
            variant="outline"
            onClick={handleCreateVersion}
            isLoading={createVersionMutation.isPending}
          >
            Create new version
          </Button>
        ) : null}

        {assessment.status !== "DRAFT" ? (
          <Button asChild variant="outline">
            <Link
              href={`/recruiter/assessments/${assessment.id}/results`}
            >
              Full leaderboard
            </Link>
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
              <div
                key={ap.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="stat-number w-5 shrink-0 text-xs text-muted-foreground">
                  {ap.order}
                </span>

                <p className="flex-1 text-sm font-medium">
                  {ap.problem.title}
                </p>

                <ProblemTypeBadge type={ap.problem.type} />
                <DifficultyBadge difficulty={ap.problem.difficulty} />

                <span className="stat-number w-12 text-right text-sm">
                  {ap.marks}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {isOpenForInvites ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">Invitations</h2>
            <Link
              href={`/recruiter/assessments/${assessment.id}/invitations`}
              className="text-xs text-primary hover:underline"
            >
              Manage all
            </Link>
          </div>

          {/* A button when closed, a full-width panel when open. */}
          <div>
            <InviteCandidatesForm assessmentId={assessment.id} />
          </div>

          <InvitationList assessmentId={assessment.id} />
        </div>
      ) : hasHistoryToShow ? (
        <div>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-sm font-semibold">Invitations</h2>
            <Link
              href={`/recruiter/assessments/${assessment.id}/invitations`}
              className="text-xs text-primary hover:underline"
            >
              Manage all
            </Link>
          </div>

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
        <VersionHistory
          assessmentId={assessment.id}
          currentId={assessment.id}
        />
      </div>

      <ConfirmDialog
        open={releaseOpen}
        onOpenChange={setReleaseOpen}
        title="Release results to candidates?"
        description="Candidates with a graded result are notified and can see their score right away. Candidates still waiting for grading are notified when it finishes. This can't be undone."
        confirmLabel="Release results"
        onConfirm={() => void handleRelease()}
      />

      <ConfirmDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        title="Close this assessment?"
        description={
          assessment.showResultImmediately
            ? "Candidates won't be able to start new attempts."
            : "Candidates won't be able to start new attempts. Results are released to candidates when you close, and everyone with a graded result gets a notification. Candidates still waiting on grading are notified when it finishes."
        }
        confirmLabel="Close assessment"
        onConfirm={() => void handleClose()}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this assessment?"
        description={`"${assessment.title}" will be deleted. This can't be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}