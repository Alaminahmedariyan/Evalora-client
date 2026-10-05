import type { Metadata } from "next";
import Link from "next/link";

import { MarketingPageHeader, MarketingSection } from "@/components/module/marketing";
import { ContactForm } from "@/components/module/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about Evalora, plans or running an assessment? Send us a message.",
  alternates: { canonical: "/contact" },
};

const TOPICS = [
  "Questions about plans or higher-volume hiring",
  "Help with an assessment, invitation or result",
  "Feedback and feature ideas",
];

export default function ContactPage() {
  return (
    <MarketingSection>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-8">
          <MarketingPageHeader
            align="left"
            eyebrow="Contact"
            title="Talk to the Evalora team"
            description="Send us a message and we'll reply to the email address you provide."
          />

          <div>
            <h2 className="text-sm font-semibold">You can write to us about</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              {TOPICS.map((topic) => (
                <li key={topic} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {topic}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">
            Looking for plan details first?{" "}
            <Link href="/pricing" className="font-medium text-primary hover:underline">
              See pricing
            </Link>
            .
          </p>
        </div>

        <ContactForm />
      </div>
    </MarketingSection>
  );
}