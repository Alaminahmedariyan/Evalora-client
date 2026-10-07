import { Code2, History, ListChecks, ShieldCheck, Trophy, Users } from "lucide-react";

import { PremiumCard } from "@/components/ui/premium-card";
import { Reveal } from "@/components/ui/reveal";

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
        <h2 className="text-2xl font-semibold tracking-tight">Every plan includes the full product</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Plans differ only in how many assessments and invitations you can use.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {INCLUDED.map((item, index) => (
          <Reveal key={item.title} delay={(index % 3) * 90} className="h-full">
            <PremiumCard className="flex h-full flex-col gap-3 p-6">
              <span className="icon-tile">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </PremiumCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}