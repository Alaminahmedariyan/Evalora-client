"use client";

import { notFound, useParams } from "next/navigation";

import { useCandidateProfile } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { CandidateProfileView } from "@/components/module/candidate";

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError } = useCandidateProfile(id);

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <CandidateProfileView profile={data.data} />
    </div>
  );
}