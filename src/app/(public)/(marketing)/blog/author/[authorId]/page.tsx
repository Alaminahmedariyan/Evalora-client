import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fetchAuthor, fetchPosts } from "@/lib/blog-server";
import { Avatar, AvatarFallback, AvatarImage, initialsFromName } from "@/components/ui/avatar";
import { MarketingPageHeader, MarketingSection } from "@/components/module/marketing";
import { BlogPagination, BlogPostCard } from "@/components/module/blog";

type Props = {
  params: Promise<{ authorId: string }>;
  searchParams: Promise<{ page?: string }>;
};

const PAGE_SIZE = 9;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { authorId } = await params;
  const author = await fetchAuthor(authorId);

  return author
    ? { title: `Articles by ${author.name}`, alternates: { canonical: `/blog/author/${author.id}` } }
    : { title: "Author not found" };
}

export default async function BlogAuthorPage({ params, searchParams }: Props) {
  const [{ authorId }, sp] = await Promise.all([params, searchParams]);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [author, result] = await Promise.all([
    fetchAuthor(authorId),
    fetchPosts({ author: authorId, page, limit: PAGE_SIZE }),
  ]);

  if (!author) notFound();

  return (
    <MarketingSection>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <Avatar className="size-16">
            <AvatarImage src={author.image ?? undefined} alt={author.name} />
            <AvatarFallback className="text-lg">{initialsFromName(author.name)}</AvatarFallback>
          </Avatar>
          <MarketingPageHeader
            align="left"
            eyebrow="Author"
            title={author.name}
            description={`${author.postCount} published article${author.postCount === 1 ? "" : "s"}`}
          />
        </div>

        {!result ? (
          <div className="status-danger rounded-md border px-4 py-3 text-sm">
            Couldn&apos;t load articles right now. Please try again in a moment.
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
              hrefForPage={(p) =>
                p > 1 ? `/blog/author/${authorId}?page=${p}` : `/blog/author/${authorId}`
              }
            />
          </>
        )}
      </div>
    </MarketingSection>
  );
}