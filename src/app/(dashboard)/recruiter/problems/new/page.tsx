import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreateProblemForm } from "@/components/form";

export default function NewProblemPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/recruiter/problems"
          className="interactive inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All problems
        </Link>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New problem</h1>
          <p className="text-sm text-muted-foreground">Add a question to your company&apos;s bank.</p>
        </div>
      </div>

      <CreateProblemForm />
    </div>
  );
}