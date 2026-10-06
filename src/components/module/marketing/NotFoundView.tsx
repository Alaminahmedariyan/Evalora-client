import Link from "next/link";

import { Button } from "@/components/ui/button";

export function NotFoundView() {
  return (
    <div className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center gap-5 px-4 py-24 text-center">
      <p className="stat-number text-6xl font-semibold text-primary">404</p>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Go to the home page</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/blog">Read the blog</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}