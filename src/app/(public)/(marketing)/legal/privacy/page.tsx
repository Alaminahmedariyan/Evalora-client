import type { Metadata } from "next";

import { LegalDocument, privacySections } from "@/components/module/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What personal information Evalora collects, how it is used and who can see it.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      current="privacy"
      title="Privacy Policy"
      intro="What we collect, how we use it and who can see it."
      sections={privacySections}
    />
  );
}