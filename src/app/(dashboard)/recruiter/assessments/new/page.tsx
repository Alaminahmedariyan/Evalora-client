import { CreateAssessmentForm } from "@/components/form";

export default function NewAssessmentPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New assessment</h1>
        <p className="text-sm text-muted-foreground">Combine problems from your bank into an assessment.</p>
      </div>
      <CreateAssessmentForm />
    </div>
  );
}