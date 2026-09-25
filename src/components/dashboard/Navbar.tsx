"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

import { useGetMe, useLogout } from "@/hooks";
import { notify } from "@/lib/toast";
import { Avatar, AvatarFallback, AvatarImage, initialsFromName } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { data } = useGetMe();
  const logoutMutation = useLogout();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const user = data?.data;

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      notify.success("Logged out");
      router.push("/login");
      router.refresh();
    } catch {
      notify.error("Couldn't log out", "Please try again.");
    }
  }

  return (
    <header className="glass-header flex h-14 items-center gap-3 px-4 md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="interactive -ml-1 rounded-md p-2 hover:bg-accent md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex-1" />

      {user ? (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="interactive flex items-center gap-2 rounded-full p-1 hover:bg-accent"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <Avatar>
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback>{initialsFromName(user.name)}</AvatarFallback>
            </Avatar>
          </button>

          <div
            role="menu"
            className={cn(
              "surface-elevated absolute right-0 top-12 w-56 origin-top-right rounded-lg p-1 transition",
              menuOpen
                ? "pointer-events-auto scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0",
            )}
          >
            <div className="border-b border-border px-3 py-2">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="interactive flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent disabled:pointer-events-none disabled:opacity-60"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}