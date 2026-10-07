import type { Metadata } from "next";

import { MarketingSection, PricingFaq } from "@/components/module/marketing";
import {
  HomeAudience,
  HomeCta,
  HomeFeatures,
  HomeHero,
  HomePlans,
  HomeProctoring,
  HomeSteps,
} from "@/components/module/homepage";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function MarketingHomePage() {
  return (
    <>
      <HomeHero />

      <MarketingSection id="how-it-works">
        <HomeSteps />
      </MarketingSection>

      <MarketingSection tone="muted" id="features">
        <HomeFeatures />
      </MarketingSection>

      <MarketingSection id="proctoring">
        <HomeProctoring />
      </MarketingSection>

      <MarketingSection tone="muted" id="audience">
        <HomeAudience />
      </MarketingSection>

      <MarketingSection id="plans">
        <HomePlans />
      </MarketingSection>

      <MarketingSection tone="muted" width="narrow" id="faq">
        <PricingFaq />
      </MarketingSection>

      <MarketingSection>
        <HomeCta />
      </MarketingSection>
    </>
  );
}