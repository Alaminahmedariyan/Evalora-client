"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useGetMe, useLogout } from "@/hooks";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage, initialsFromName } from "@/components/ui/avatar";
import Logo from "@/assets/svg/logo";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

function dashboardPathFor(role?: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "RECRUITER") return "/recruiter";
  return "/candidate";
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data } = useGetMe();
  const logoutMutation = useLogout();
  const user = data?.data;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      notify.success("Logged out");
      setMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      notify.error("Couldn't log out", "Please try again.");
    }
  }

  return (
    <header className="glass-header sticky top-0 z-40">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <Logo />
          <span className="text-sm font-semibold tracking-tight text-foreground">Evalora</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn("interactive hover:text-foreground", active && "font-medium text-foreground")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
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
                <Link
                  href={dashboardPathFor(user.role)}
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                  className="interactive flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <LayoutDashboard className="size-4" aria-hidden="true" />
                  Dashboard
                </Link>
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
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="interactive ml-auto rounded-md p-2 hover:bg-accent md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="interactive rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              {user ? (
                <>
                  <Button asChild variant="outline" onClick={() => setMobileOpen(false)}>
                    <Link href={dashboardPathFor(user.role)}>Dashboard</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    isLoading={logoutMutation.isPending}
                    onClick={() => {
                      setMobileOpen(false);
                      void handleLogout();
                    }}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" onClick={() => setMobileOpen(false)}>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild onClick={() => setMobileOpen(false)}>
                    <Link href="/register">Get started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}