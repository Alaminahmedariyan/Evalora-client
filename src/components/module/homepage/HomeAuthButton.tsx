"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { useGetMe } from "@/hooks";
import { Button } from "@/components/ui/button";

type HomeAuthButtonProps = Pick<ComponentProps<typeof Button>, "variant" | "size" | "className"> & {
  guestLabel: string;
  guestHref?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

// Same destinations as the role-aware button in PricingCards.
function destinationFor(role: string): { href: string; label: string } {
  if (role === "RECRUITER") {
    return { href: "/recruiter", label: "Go to dashboard" };
  }

  if (role === "CANDIDATE") {
    return { href: "/onboarding/company", label: "Register your company" };
  }

  return { href: "/admin", label: "Go to dashboard" };
}

export function HomeAuthButton({
  guestLabel,
  guestHref = "/register",
  variant,
  size,
  className,
  leading,
  trailing,
}: HomeAuthButtonProps) {
  const { data } = useGetMe();
  const role = data?.data?.role;
  const target = role ? destinationFor(role) : { href: guestHref, label: guestLabel };

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={target.href}>
        {leading}
        {target.label}
        {trailing}
      </Link>
    </Button>
  );
}