import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MarketingPageHeader, MarketingSection } from "@/components/module/marketing";
import { AboutAudiences, AboutPrinciples, AboutSteps } from "@/components/module/aboutus";

export const metadata: Metadata = {
  title: "About",
  description:
    "Evalora is a developer assessment platform: build problems, invite candidates, and review results and proctoring signals in one place.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <MarketingSection>
        <div className="flex flex-col gap-6">
          <MarketingPageHeader
            align="left"
            eyebrow="About Evalora"
            title="Hiring that tests the work, not the résumé"
            description="Evalora is a developer assessment platform. Teams build coding assessments, invite candidates and review the results in one place, so hiring does not depend on spreadsheets and scattered emails."
          />
          <p className="max-w-3xl text-base leading-7 text-foreground/90">
            An assessment can mix multiple-choice, coding and written problems. Multiple-choice
            answers are scored automatically. Coding and written answers wait in a grading queue,
            where a reviewer reads the answer (and, for code, sees it next to the sample test cases)
            and gives the marks. Coding answers are reviewed by people, not run automatically.
          </p>
        </div>
      </MarketingSection>

      <MarketingSection tone="muted">
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl font-semibold tracking-tight">How an assessment works</h2>
          <AboutSteps />
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl font-semibold tracking-tight">Built for both sides of the table</h2>
          <AboutAudiences />
        </div>
      </MarketingSection>

      <MarketingSection tone="muted">
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl font-semibold tracking-tight">What we care about</h2>
          <AboutPrinciples />
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="card-evalora flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Try it with your next hire</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The Free plan lets you run real assessments. Questions? We&apos;re happy to help.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/register">Create a free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </MarketingSection>
    </>
  );
}