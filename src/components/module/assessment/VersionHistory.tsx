"use client";

import Link from "next/link";
import { History } from "lucide-react";

import { useAssessmentVersions, useRestoreAssessmentVersion } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AssessmentStatusBadge } from "./AssessmentStatusBadge";

export function VersionHistory({ assessmentId, currentId }: { assessmentId: string; currentId: string }) {
  const { data, isPending, isError } = useAssessmentVersions(assessmentId);
  const restoreMutation = useRestoreAssessmentVersion();

  async function handleRestore(versionId: string) {
    if (!window.confirm("Restore this version? A new draft copy will be created from it.")) return;
    try {
      const res = await restoreMutation.mutateAsync(versionId);
      notify.success("Version restored as a new draft");
      window.location.href = `/recruiter/assessments/${res.data.id}`;
    } catch (error) {
      notify.error("Couldn't restore version", isApiError(error) ? error.message : undefined);
    }
  }

  if (isPending) {
    return <Skeleton className="h-16 w-full" />;
  }

  if (isError || !data?.data.length) {
    return null; // no version history to show is a normal state, not an error worth surfacing
  }

  if (data.data.length === 1) {
    return <p className="text-sm text-muted-foreground">This is the only version.</p>;
  }

  return (
    <div className="card-evalora flex flex-col divide-y divide-border">
      {data.data.map((version) => (
        <div key={version.id} className="flex items-center gap-3 px-4 py-3 text-sm">
          <History className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <Link
            href={`/recruiter/assessments/${version.id}`}
            className={`flex-1 hover:text-primary ${version.id === currentId ? "font-semibold text-primary" : ""}`}
          >
            v{version.version} {version.id === currentId ? "(viewing)" : ""}
          </Link>
          <AssessmentStatusBadge status={version.status} />
          <span className="text-xs text-muted-foreground">{new Date(version.createdAt).toLocaleDateString()}</span>
          {!version.isLatestVersion ? (
            <Button size="sm" variant="outline" onClick={() => handleRestore(version.id)} isLoading={restoreMutation.isPending}>
              Restore
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}