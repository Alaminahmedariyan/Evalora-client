import { AssessmentList } from "@/components/module/assessment";

export default function RecruiterAssessmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assessments</h1>
        <p className="text-sm text-muted-foreground">Create and manage your coding assessments.</p>
      </div>
      <AssessmentList />
    </div>
  );
}