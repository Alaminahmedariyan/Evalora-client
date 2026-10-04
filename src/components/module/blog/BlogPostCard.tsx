import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";

import type { BlogPostSummary } from "@/types";
import { buildBlogHref, formatBlogDate } from "@/lib/blog";

export function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <article className="card-evalora interactive group relative flex h-full flex-col overflow-hidden hover:border-primary/40">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="brand-accent-strip flex size-full items-center justify-center">
            <Newspaper className="size-10 text-white/80" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link
          href={buildBlogHref({ category: post.category.slug })}
          className="interactive relative z-10 w-fit rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-accent"
        >
          {post.category.name}
        </Link>

        <h2 className="text-lg font-semibold leading-snug tracking-tight">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>

        <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>

        <p className="mt-auto pt-2 text-xs text-muted-foreground">
          {post.author.name} · {formatBlogDate(post.publishedAt)} · {post.readingTimeMinutes} min read
        </p>
      </div>
    </article>
  );
}