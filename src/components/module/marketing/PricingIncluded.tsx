import { Code2, History, ListChecks, ShieldCheck, Trophy, Users } from "lucide-react";

const INCLUDED = [
  {
    icon: Code2,
    title: "MCQ, coding and written questions",
    body: "Mix all three types in one assessment, with sample test cases for coding problems.",
  },
  {
    icon: ListChecks,
    title: "Auto-graded MCQs and a grading queue",
    body: "Multiple-choice answers score instantly; coding and written answers wait in a queue for your reviewers.",
  },
  {
    icon: ShieldCheck,
    title: "Proctoring with a review timeline",
    body: "Tab switches and other flagged activity are recorded, so you can review each attempt after it ends.",
  },
  {
    icon: Trophy,
    title: "Results and leaderboards",
    body: "Scores, pass or fail status and ranks for every assessment.",
  },
  {
    icon: Users,
    title: "Candidate directory",
    body: "Browse candidate profiles, resumes and links in one place.",
  },
  {
    icon: History,
    title: "Assessment versions",
    body: "Update an assessment without losing the history of earlier versions.",
  },
];

export function PricingIncluded() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-semibold">Every plan includes the full product</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Plans differ only in how many assessments and invitations you can use.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {INCLUDED.map((item) => (
          <div key={item.title} className="flex flex-col gap-2">
            <item.icon className="size-5 text-primary" aria-hidden="true" />
            <h3 className="text-sm font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}