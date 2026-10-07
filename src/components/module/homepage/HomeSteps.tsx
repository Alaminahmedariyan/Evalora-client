import { ClipboardCheck, Mail, Timer, Trophy, type LucideIcon } from "lucide-react";

import { MarketingSectionHeading } from "@/components/module/marketing";
import { PremiumCard } from "@/components/ui/premium-card";
import { Reveal } from "@/components/ui/reveal";

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ClipboardCheck,
    title: "Build the assessment",
    body: "Write multiple-choice, coding and written problems in your company's private problem bank, then set marks, duration, passing marks and attempt rules.",
  },
  {
    icon: Mail,
    title: "Invite candidates",
    body: "Send each candidate a private link by email. The link expires, and you can invite someone before they have an account.",
  },
  {
    icon: Timer,
    title: "Candidates take it",
    body: "Every attempt runs on a countdown and is submitted automatically when time is up, while proctoring signals are recorded.",
  },
  {
    icon: Trophy,
    title: "Review and rank",
    body: "Multiple-choice answers score instantly. Coding and written answers go to a reviewer, and results and ranks follow.",
  },
];

export function HomeSteps() {
  return (
    <div className="flex flex-col gap-16">
      <MarketingSectionHeading
        align="center"
        eyebrow="How it works"
        title={
          <>
            From the first problem to <span className="text-gradient-brand">ranked results</span>
          </>
        }
        description="Four steps, one workspace, no spreadsheets in between."
      />

      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute left-[12%] right-[12%] top-[3.1rem] hidden border-t border-dashed border-primary/30 lg:block"
        />

        <ol className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Reveal delay={index * 110} className="h-full">
                <PremiumCard tilt className="flex h-full flex-col gap-5 p-7">
                  <div className="flex items-center justify-between">
                    <span className="icon-tile size-12">
                      <step.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="stat-number text-5xl font-black text-primary/15">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </PremiumCard>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}