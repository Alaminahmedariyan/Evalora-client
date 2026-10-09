"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Leaderboard } from "@/components/module/result";

export default function RecruiterAssessmentResultsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={`/recruiter/assessments/${id}`}
          className="interactive inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to assessment
        </Link>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Results &amp; leaderboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Every candidate&apos;s score for this assessment. Click a candidate
            to review their attempt.
          </p>
        </div>
      </div>

      <Leaderboard assessmentId={id} />
    </div>
  );
}