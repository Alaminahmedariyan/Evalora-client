"use client";

import { notFound, useParams } from "next/navigation";

import { useAssessment } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { AssessmentDetailView } from "@/components/module/assessment";

export default function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError } = useAssessment(id);

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{data.data.title}</h1>
      <AssessmentDetailView assessment={data.data} />
    </div>
  );
}