import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";

import { buildBlogHref, formatBlogDate } from "@/lib/blog";
import { fetchPost } from "@/lib/blog-server";
import { config } from "@/lib/config";
import { Avatar, AvatarFallback, AvatarImage, initialsFromName } from "@/components/ui/avatar";
import { MarketingPageHeader, MarketingSection } from "@/components/module/marketing";
import { BlogContent, BlogPostCard } from "@/components/module/blog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) return { title: "Article not found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      ...(post.publishedAt && { publishedTime: post.publishedAt }),
      authors: [post.author.name],
      ...(post.coverImage && { images: [post.coverImage] }),
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) notFound();

  const url = `${config.siteUrl}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    ...(post.coverImage && { image: [post.coverImage] }),
    ...(post.publishedAt && { datePublished: post.publishedAt }),
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: post.author.name },
    mainEntityOfPage: url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // "<" is escaped so post text can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <MarketingSection width="narrow" className="pb-6">
        <Link
          href="/blog"
          className="interactive mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All articles
        </Link>

        <MarketingPageHeader
          align="left"
          eyebrow={post.category.name}
          title={post.title}
          description={post.excerpt}
        >
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <Link
              href={`/blog/author/${post.author.id}`}
              className="interactive flex items-center gap-2 hover:text-foreground"
            >
              <Avatar className="size-7">
                <AvatarImage src={post.author.image ?? undefined} alt={post.author.name} />
                <AvatarFallback className="text-xs">{initialsFromName(post.author.name)}</AvatarFallback>
              </Avatar>
              {post.author.name}
            </Link>
            <span>{formatBlogDate(post.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {post.readingTimeMinutes} min read
            </span>
          </div>
        </MarketingPageHeader>
      </MarketingSection>

      {post.coverImage ? (
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
            <Image
              src={post.coverImage}
              alt=""
              fill
              priority
              sizes="(min-width: 896px) 896px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      <MarketingSection width="narrow" className="py-10">
        <BlogContent markdown={post.content} />

        {post.tags.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={buildBlogHref({ tag: tag.slug })}
                className="interactive rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        ) : null}
      </MarketingSection>

      {post.related.length > 0 ? (
        <MarketingSection tone="muted">
          <h2 className="mb-6 text-xl font-semibold">Keep reading</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {post.related.map((related) => (
              <BlogPostCard key={related.id} post={related} />
            ))}
          </div>
        </MarketingSection>
      ) : null}
    </>
  );
}