import { ProblemList } from "@/components/module/problem/ProblemList";

export default function RecruiterProblemsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
        <p className="text-sm text-muted-foreground">Your company&apos;s question bank.</p>
      </div>
      <ProblemList />
    </div>
  );
}