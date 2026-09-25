"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { navByRole, roleLabel } from "./nav-config";
import Logo from "@/assets/svg/logo";

function isActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/recruiter" || href === "/candidate") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  role,
  variant = "desktop",
}: {
  role: UserRole;
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  const items = navByRole[role];

  return (
    <aside
      className={cn(
        "h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        variant === "desktop" ? "hidden md:flex" : "flex",
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-5">
        <Logo />
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">Evalora</span>
        <span className="ml-auto rounded-full bg-sidebar-accent px-2 py-0.5 text-[11px] font-medium text-sidebar-accent-foreground">
          {roleLabel[role]}
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "interactive flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/"
          className="interactive flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Home className="size-4" aria-hidden="true" />
          Home
        </Link>
      </div>
    </aside>
  );
}