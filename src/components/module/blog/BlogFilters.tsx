"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import type { BlogCategory, BlogTagWithCount } from "@/types";
import { buildBlogHref } from "@/lib/blog";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const SEARCH_DELAY_MS = 400;
const MAX_TAGS_SHOWN = 20;

type BlogFiltersProps = {
  categories: BlogCategory[];
  tags: BlogTagWithCount[];
  current: { category?: string; tag?: string; search?: string };
};

function Pill({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "interactive inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

export function BlogFilters({ categories, tags, current }: BlogFiltersProps) {
  const router = useRouter();
  const { category, tag, search } = current;

  const [value, setValue] = useState(search ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the box in sync when the URL changes from outside (e.g. "Clear filters").
  useEffect(() => {
    setValue((prev) => (prev.trim() === (search ?? "") ? prev : (search ?? "")));
  }, [search]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function handleChange(next: string) {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      // Read the live URL so a category/tag clicked meanwhile isn't overwritten.
      const params = new URLSearchParams(window.location.search);
      const trimmed = next.trim();

      if (trimmed) params.set("search", trimmed);
      else params.delete("search");
      params.delete("page");

      const qs = params.toString();
      router.replace(qs ? `/blog?${qs}` : "/blog", { scroll: false });
    }, SEARCH_DELAY_MS);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search articles..."
          aria-label="Search articles"
          className="pl-9"
        />
      </div>

      <nav aria-label="Categories" className="flex flex-wrap gap-2">
        <Pill href={buildBlogHref({ search, tag })} active={!category}>
          All
        </Pill>
        {categories.map((item) => (
          <Pill
            key={item.id}
            href={buildBlogHref({ search, tag, category: item.slug })}
            active={category === item.slug}
          >
            {item.name}
            <span className="opacity-70">({item.postCount})</span>
          </Pill>
        ))}
      </nav>

      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Tags:</span>
          {tags.slice(0, MAX_TAGS_SHOWN).map((item) => {
            const active = tag === item.slug;
            return (
              <Pill
                key={item.id}
                href={buildBlogHref({ search, category, tag: active ? undefined : item.slug })}
                active={active}
              >
                #{item.name}
              </Pill>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}