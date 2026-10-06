import type { Metadata } from "next";

import { MarketingSection } from "@/components/module/marketing";
import { HomeCta, HomeFeatures, HomeHero, HomePlans } from "@/components/module/homepage";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function MarketingHomePage() {
  return (
    <>
      <HomeHero />

      <MarketingSection tone="muted" id="features">
        <HomeFeatures />
      </MarketingSection>

      <MarketingSection id="plans">
        <HomePlans />
      </MarketingSection>

      <MarketingSection tone="muted">
        <HomeCta />
      </MarketingSection>
    </>
  );
}