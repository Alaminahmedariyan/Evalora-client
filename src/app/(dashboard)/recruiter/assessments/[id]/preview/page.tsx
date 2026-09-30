"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useAssessment } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { AssessmentPreview } from "@/components/module/assessment";

export default function AssessmentPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError } = useAssessment(id);

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    notFound();
  }

  const assessment = data.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/recruiter/assessments/${assessment.id}`} className="interactive mb-2 flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to assessment
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{assessment.title} — Preview</h1>
        <p className="text-sm text-muted-foreground">
          This is a content review — correct answers and hidden test cases are shown, unlike what a candidate would see.
        </p>
      </div>
      <AssessmentPreview assessment={assessment} />
    </div>
  );
}