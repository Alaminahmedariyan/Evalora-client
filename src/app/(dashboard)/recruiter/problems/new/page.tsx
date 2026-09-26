import { CreateProblemForm } from "@/components/form";

export default function NewProblemPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New problem</h1>
        <p className="text-sm text-muted-foreground">Add a question to your company&apos;s bank.</p>
      </div>
      <CreateProblemForm />
    </div>
  );
}