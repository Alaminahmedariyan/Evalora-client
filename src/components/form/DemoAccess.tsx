"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, ChevronDown, Crown, ShieldCheck, User } from "lucide-react";

import { getMe } from "@/api";
import type { DemoRole } from "@/api";
import { useDemoLogin } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { dashboardPathFor } from "@/lib/dashboard-path";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";

const ROLES: { role: DemoRole; label: string; icon: typeof User }[] = [
  { role: "CANDIDATE", label: "Candidate", icon: User },
  { role: "RECRUITER", label: "Recruiter", icon: Briefcase },
  { role: "ADMIN", label: "Admin", icon: Crown },
];

type DemoAccessProps = {
  // "navbar": compact button with a dropdown. "card": full-width block (login page, mobile menu).
  variant?: "navbar" | "card";
};

export function DemoAccess({ variant = "card" }: DemoAccessProps) {
  const router = useRouter();
  const demoMutation = useDemoLogin();
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<DemoRole | null>(null);

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    if (!open || variant !== "navbar") return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, variant]);

  async function enterAs(role: DemoRole) {
    setPendingRole(role);

    try {
      await demoMutation.mutateAsync({ role });

      let destination = "/";

      try {
        const me = await getMe();
        destination = dashboardPathFor(me.data.role);
      } catch {
        // Signed in but the profile call failed: the home page still works.
      }

      notify.success("Demo session started");
      setOpen(false);
      router.push(destination);
      router.refresh();
    } catch (error) {
      const message = isApiError(error)
        ? error.message
        : "Couldn't start the demo session.";
      notify.error("Demo access failed", message);
    } finally {
      setPendingRole(null);
    }
  }

  const roleButtons = ROLES.map(({ role, label, icon: Icon }) => (
    <Button
      key={role}
      type="button"
      variant={variant === "navbar" ? "ghost" : "outline"}
      className={variant === "navbar" ? "w-full justify-start" : undefined}
      isLoading={pendingRole === role}
      disabled={pendingRole !== null}
      onClick={() => void enterAs(role)}
    >
      <Icon className="mr-1.5 size-4" />
      {label}
    </Button>
  ));

  if (variant === "navbar") {
    return (
      <div ref={containerRef} className="relative">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <ShieldCheck className="mr-1.5 size-4" />
          Super Admin
          <ChevronDown className="ml-1 size-3.5" />
        </Button>

        {open ? (
          <div
            role="menu"
            className="absolute left-1/2 top-full z-50 mt-2 flex w-48 -translate-x-1/2 flex-col gap-1 rounded-lg border bg-popover p-2 text-popover-foreground shadow-lg"
          >
            <p className="px-2 pb-1 text-xs text-muted-foreground">
              Explore without login
            </p>
            {roleButtons}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <ShieldCheck className="mr-2 size-4" />
        Super Admin — explore without login
      </Button>

      {open ? <div className="grid grid-cols-3 gap-2">{roleButtons}</div> : null}
    </div>
  );
}