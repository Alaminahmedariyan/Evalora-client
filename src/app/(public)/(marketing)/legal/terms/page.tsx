import type { Metadata } from "next";

import { LegalDocument, termsSections } from "@/components/module/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using Evalora as a recruiter, company or candidate.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <LegalDocument
      current="terms"
      title="Terms of Service"
      intro="The rules for using Evalora, whether you hire or take assessments."
      sections={termsSections}
    />
  );
}