import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";

import { buildBlogHref } from "@/lib/blog";
import { fetchCategories, fetchPosts, fetchTags } from "@/lib/blog-server";
import { Button } from "@/components/ui/button";
import { MarketingPageHeader, MarketingSection } from "@/components/module/marketing";
import { BlogFilters, BlogPagination, BlogPostCard } from "@/components/module/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Practical guides on coding assessments, proctoring and engineering hiring from the Evalora team.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
};

type SearchParams = Promise<{
  page?: string;
  category?: string;
  tag?: string;
  search?: string;
}>;

const PAGE_SIZE = 9;

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const filters = {
    category: sp.category || undefined,
    tag: sp.tag || undefined,
    search: sp.search?.trim() || undefined,
  };
  const hasFilters = Boolean(filters.category || filters.tag || filters.search);

  const [result, categories, tags] = await Promise.all([
    fetchPosts({ ...filters, page, limit: PAGE_SIZE }),
    fetchCategories(),
    fetchTags(),
  ]);

  return (
    <MarketingSection>
      <div className="flex flex-col gap-10">
        <MarketingPageHeader
          align="left"
          eyebrow="Blog"
          title="Ideas for better technical hiring"
          description="Practical guides on assessments, proctoring and running a fair hiring process."
        />

        <BlogFilters categories={categories} tags={tags} current={filters} />

        {!result ? (
          <div className="status-danger rounded-md border px-4 py-3 text-sm">
            Couldn&apos;t load articles right now. Please try again in a moment.
          </div>
        ) : result.posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Newspaper className="size-8 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">No articles found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasFilters ? "Try a different search or clear your filters." : "New articles are on the way."}
              </p>
            </div>
            {hasFilters ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/blog">Clear filters</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>

            <BlogPagination
              page={result.meta.page}
              totalPages={result.meta.totalPage}
              hrefForPage={(p) => buildBlogHref({ ...filters, page: p })}
            />
          </>
        )}
      </div>
    </MarketingSection>
  );
}
