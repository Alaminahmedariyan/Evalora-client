import { ClipboardCheck, History, ListChecks, ShieldCheck, Trophy, Users } from "lucide-react";

import { MarketingSectionHeading } from "@/components/module/marketing";

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: "Three question types",
    body: "Mix multiple-choice, coding and written questions in a single assessment.",
  },
  {
    icon: ShieldCheck,
    title: "Proctoring signals",
    body: "Tab switches, full-screen exits, copy and paste are recorded in a timeline you can read after the attempt.",
  },
  {
    icon: ListChecks,
    title: "A grading queue",
    body: "Multiple-choice answers are scored automatically. Coding and written answers wait for a reviewer, with sample test cases beside the code.",
  },
  {
    icon: Trophy,
    title: "Results and ranks",
    body: "Scores, pass or fail status and a leaderboard for every assessment.",
  },
  {
    icon: History,
    title: "Assessment versions",
    body: "Update an assessment without losing the history of earlier versions.",
  },
  {
    icon: Users,
    title: "Candidate profiles",
    body: "Candidates share a profile, résumé and links. Recruiters browse the ones who chose to be visible.",
  },
];

export function HomeFeatures() {
  return (
    <div className="flex flex-col gap-12">
      <MarketingSectionHeading
        align="center"
        eyebrow="Features"
        title={
          <>
            Everything for a <span className="text-gradient-brand">fair, reviewable</span> assessment
          </>
        }
        description="From writing the first problem to reading the proctoring timeline."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <div key={feature.title} className="card-premium flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between">
              <span className="icon-tile">
                <feature.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="stat-number text-xs font-medium text-muted-foreground/60">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}