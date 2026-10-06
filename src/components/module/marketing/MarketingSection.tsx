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
    <section id={id} className={cn("relative", tone === "muted" && "section-muted")}>
      <div
        className={cn(
          "mx-auto px-4 py-16 md:px-6 md:py-20",
          width === "narrow" ? "max-w-3xl" : "max-w-6xl",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}