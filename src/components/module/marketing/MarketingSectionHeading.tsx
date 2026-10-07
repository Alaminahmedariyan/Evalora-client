import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MarketingSectionProps = {
  id?: string;
  tone?: "default" | "muted";
  width?: "default" | "narrow";
  className?: string;
  children: ReactNode;
};

export function MarketingSection({
  id,
  tone = "default",
  width = "default",
  className,
  children,
}: MarketingSectionProps) {
  return (
    <section id={id} className={cn("relative scroll-mt-24", tone === "muted" && "section-muted")}>
      <div
        className={cn(
          "mx-auto px-5 py-20 sm:px-8 md:py-28",
          width === "narrow" ? "max-w-3xl" : "max-w-7xl",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}