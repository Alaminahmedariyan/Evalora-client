import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MarketingPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
};

export function MarketingPageHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  children,
}: MarketingPageHeaderProps) {
  const centered = align === "center";

  return (
    <header
      className={cn(
        "flex flex-col gap-3",
        centered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <span className="brand-accent-strip h-1 w-12 rounded-full" aria-hidden="true" />

      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
      ) : null}

      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>

      {description ? (
        <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
      ) : null}

      {children}
    </header>
  );
}