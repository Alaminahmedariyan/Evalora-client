import type { Metadata } from "next";

import {
  MarketingPageHeader,
  MarketingSection,
  PricingCards,
  PricingFaq,
  PricingIncluded,
} from "@/components/module/marketing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for technical hiring assessments. Start free and upgrade when your hiring grows.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <MarketingSection>
        <div className="flex flex-col gap-12">
          <MarketingPageHeader
            eyebrow="Pricing"
            title="Simple pricing that grows with your hiring"
            description="Start free. Upgrade when you need more assessments and invitations. Paid plans are one-time payments for 30 days, with no automatic renewal."
          />
          <PricingCards />
        </div>
      </MarketingSection>

      <MarketingSection tone="muted">
        <PricingIncluded />
      </MarketingSection>

      <MarketingSection width="narrow">
        <PricingFaq />
      </MarketingSection>
    </>
  );
}