import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MarketingSectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
};

export function MarketingSectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  children,
}: MarketingSectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-6",
        centered && "justify-center text-center",
        className,
      )}
    >
      <div className={cn("flex max-w-2xl flex-col gap-3", centered && "items-center")}>
        {eyebrow ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <span className="size-1.5 rounded-full bg-brand-gradient" aria-hidden="true" />
            {eyebrow}
          </span>
        ) : null}

        <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>

        {description ? <p className="text-base text-muted-foreground md:text-lg">{description}</p> : null}
      </div>

      {children}
    </div>
  );
}