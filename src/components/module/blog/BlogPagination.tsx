import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BlogPaginationProps = {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

export function BlogPagination({ page, totalPages, hrefForPage }: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
      {page > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link href={hrefForPage(page - 1)} rel="prev">
            Previous
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}

      <ul className="hidden items-center gap-1 sm:flex">
        {pages.map((p) => (
          <li key={p}>
            <Link
              href={hrefForPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "interactive flex size-9 items-center justify-center rounded-md text-sm",
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {p}
            </Link>
          </li>
        ))}
      </ul>

      <span className="text-sm text-muted-foreground sm:hidden">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Button asChild variant="outline" size="sm">
          <Link href={hrefForPage(page + 1)} rel="next">
            Next
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </nav>
  );
}