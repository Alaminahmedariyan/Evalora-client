import type { ReactNode } from "react";
import Link from "next/link";

import { LEGAL } from "@/constants/legal";
import { cn } from "@/lib/utils";
import { MarketingPageHeader, MarketingSection } from "@/components/module/marketing";

export type LegalSectionData = { id: string; title: string; body: ReactNode };

const DOCS = [
  { key: "terms", label: "Terms of Service", href: "/legal/terms" },
  { key: "privacy", label: "Privacy Policy", href: "/legal/privacy" },
] as const;

export function LegalP({ children }: { children: ReactNode }) {
  return <p className="my-3 text-base leading-7 text-foreground/90">{children}</p>;
}

export function LegalList({ children }: { children: ReactNode }) {
  return (
    <ul className="my-3 list-disc space-y-2 pl-6 text-base leading-7 text-foreground/90">
      {children}
    </ul>
  );
}

export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
    >
      {children}
    </Link>
  );
}

type LegalDocumentProps = {
  current: (typeof DOCS)[number]["key"];
  title: string;
  intro: string;
  sections: LegalSectionData[];
};

export function LegalDocument({ current, title, intro, sections }: LegalDocumentProps) {
  return (
    <MarketingSection>
      <div className="flex flex-col gap-10">
        <MarketingPageHeader align="left" eyebrow="Legal" title={title} description={intro}>
          <p className="text-sm text-muted-foreground">Last updated {LEGAL.lastUpdated}</p>
        </MarketingPageHeader>

        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav aria-label="Legal documents" className="flex flex-wrap gap-2 lg:flex-col">
              {DOCS.map((doc) => (
                <Link
                  key={doc.key}
                  href={doc.href}
                  aria-current={doc.key === current ? "page" : undefined}
                  className={cn(
                    "interactive rounded-md border px-3 py-1.5 text-sm",
                    doc.key === current
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {doc.label}
                </Link>
              ))}
            </nav>

            <nav aria-label="On this page" className="mt-8 hidden lg:block">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                On this page
              </p>
              <ol className="flex flex-col gap-2 text-sm">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="interactive text-muted-foreground hover:text-foreground"
                    >
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="max-w-3xl">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 border-t border-border py-8 first:border-t-0 first:pt-0"
              >
                <h2 className="text-xl font-semibold tracking-tight">
                  {index + 1}. {section.title}
                </h2>
                {section.body}
              </section>
            ))}
          </article>
        </div>
      </div>
    </MarketingSection>
  );
}