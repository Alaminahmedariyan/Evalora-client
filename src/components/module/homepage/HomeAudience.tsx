import Link from "next/link";
import { ArrowRight, Briefcase, Check, Code2, type LucideIcon } from "lucide-react";

import { MarketingSectionHeading } from "@/components/module/marketing";
import { PremiumCard } from "@/components/ui/premium-card";
import { Reveal } from "@/components/ui/reveal";

const AUDIENCES: {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  points: string[];
}[] = [
  {
    id: "teams",
    icon: Briefcase,
    eyebrow: "For hiring teams",
    title: "Run assessments your whole team can trust",
    points: [
      "A private problem bank for your company",
      "Build assessments with marks, duration and passing marks",
      "Invite by email and track every invitation",
      "Review answers in a grading queue",
      "See results, ranks and the proctoring timeline",
      "Browse candidate profiles that chose to be visible",
    ],
  },
  {
    id: "candidates",
    icon: Code2,
    eyebrow: "For candidates",
    title: "Show what you can build, on a fair clock",
    points: [
      "Open the private link from your invitation",
      "Work through multiple-choice, coding and written questions",
      "A clear countdown, with automatic submit when time ends",
      "See your result when the company shares it",
      "Keep a profile with skills, résumé and links",
      "Choose whether recruiters can find you",
    ],
  },
];

export function HomeAudience() {
  return (
    <div className="flex flex-col gap-16">
      <MarketingSectionHeading
        align="center"
        eyebrow="Who it is for"
        title={
          <>
            Built for <span className="text-gradient-brand">both sides</span> of hiring
          </>
        }
        description="One platform, two clear experiences."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {AUDIENCES.map((audience, index) => (
          <Reveal key={audience.id} delay={index * 120} className="h-full">
            <PremiumCard tilt className="flex h-full flex-col gap-7 p-8 md:p-10">
              <div className="flex items-center gap-4">
                <span className="icon-tile size-14">
                  <audience.icon className="size-6" aria-hidden="true" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{audience.eyebrow}</p>
              </div>

              <h3 className="text-balance text-2xl font-bold tracking-tight md:text-3xl">{audience.title}</h3>

              <ul className="flex flex-1 flex-col gap-3.5">
                {audience.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>

              {audience.id === "teams" ? (
                <Link
                  href="/pricing"
                  className="interactive group inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary"
                >
                  Compare plans
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              ) : null}
            </PremiumCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}