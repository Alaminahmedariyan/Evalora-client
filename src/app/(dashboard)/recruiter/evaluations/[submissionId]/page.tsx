"use client";

import { notFound, useParams } from "next/navigation";

import { useSubmission } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { EvaluateSubmissionForm } from "@/components/form";
import { ProblemTypeBadge } from "@/components/module/problem/ProblemTypeBadge";

export default function EvaluateSubmissionPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { data, isPending, isError } = useSubmission(submissionId);

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    notFound();
  }

  const submission = data.data;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{submission.problem.title}</h1>
        <ProblemTypeBadge type={submission.problem.type} />
      </div>
      <EvaluateSubmissionForm submission={submission} />
    </div>
  );
}