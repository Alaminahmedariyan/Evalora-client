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
    <section id={id} className={cn(tone === "muted" && "border-t border-border bg-card")}>
      <div
        className={cn(
          "mx-auto px-4 py-16 md:px-6",
          width === "narrow" ? "max-w-3xl" : "max-w-6xl",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}