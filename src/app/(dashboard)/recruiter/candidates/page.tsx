import { CandidateDirectoryTable } from "@/components/module/candidate";

export default function RecruiterCandidatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Candidates</h1>
        <p className="text-sm text-muted-foreground">Browse candidate profiles across the platform.</p>
      </div>
      <CandidateDirectoryTable />
    </div>
  );
}