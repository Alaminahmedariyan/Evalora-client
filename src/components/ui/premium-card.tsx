"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type PremiumCardVariant = "default" | "highlight" | "glass" | "flat";

export type PremiumCardProps = React.ComponentProps<"div"> & {
  // default: standard card. highlight: gradient border. glass: frosted. flat: quiet, no shadow.
  variant?: PremiumCardVariant;
  // Hover lift, cursor spotlight and border glow. Turn off for cards that are not clickable or promotional.
  interactive?: boolean;
  // Small 3D tilt that follows the cursor. Best for large feature cards.
  tilt?: boolean;
};

const MAX_TILT_DEG = 3.5;

export function PremiumCard({
  variant = "default",
  interactive = true,
  tilt = false,
  className,
  ref,
  onPointerMove,
  onPointerLeave,
  ...props
}: PremiumCardProps) {
  const innerRef = React.useRef<HTMLDivElement | null>(null);

  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;

      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);

    const node = innerRef.current;
    if (!node || !interactive || event.pointerType !== "mouse") {
      return;
    }

    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    node.style.setProperty("--mx", `${x}px`);
    node.style.setProperty("--my", `${y}px`);

    if (tilt) {
      node.style.setProperty("--ry", `${(x / rect.width - 0.5) * MAX_TILT_DEG * 2}deg`);
      node.style.setProperty("--rx", `${-(y / rect.height - 0.5) * MAX_TILT_DEG * 2}deg`);
      node.dataset.tilting = "true";
    }
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);

    const node = innerRef.current;
    if (!node) {
      return;
    }

    node.style.removeProperty("--rx");
    node.style.removeProperty("--ry");
    delete node.dataset.tilting;
  }

  return (
    <div
      ref={setRef}
      data-slot="premium-card"
      data-variant={variant}
      data-interactive={interactive ? "true" : "false"}
      className={cn("premium-card", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    />
  );
}