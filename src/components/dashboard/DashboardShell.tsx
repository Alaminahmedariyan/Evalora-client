"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";

import type { UserRole } from "@/types";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

type DashboardShellProps = {
  userRole: UserRole;     
  children: ReactNode;
};

export function DashboardShell({ userRole, children }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={userRole} />  

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative h-full w-64">
            <Sidebar role={userRole} variant="mobile" />
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}