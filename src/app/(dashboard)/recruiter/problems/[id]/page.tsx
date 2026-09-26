"use client";

import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import { Pencil } from "lucide-react";

import { useProblem } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ProblemDetailView } from "@/components/module/problem/ProblemDetailView";
import { EditProblemForm } from "@/components/form";

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError } = useProblem(id);
  const [editing, setEditing] = useState(false);

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    notFound();
  }

  const problem = data.data;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{problem.title}</h1>
          <p className="text-sm text-muted-foreground">Created {new Date(problem.createdAt).toLocaleDateString()}</p>
        </div>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" aria-hidden="true" />
            Edit
          </Button>
        ) : null}
      </div>

      {editing ? (
        <EditProblemForm problem={problem} onSaved={() => setEditing(false)} />
      ) : (
        <ProblemDetailView problem={problem} />
      )}
    </div>
  );
}