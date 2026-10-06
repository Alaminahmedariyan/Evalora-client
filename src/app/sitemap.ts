import type { MetadataRoute } from "next";

import { fetchPosts } from "@/lib/blog-server";
import { config } from "@/lib/config";

export const revalidate = 3600;

type Frequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

// The backend caps a page at 24 posts; MAX_PAGES stops a runaway loop.
const PAGE_SIZE = 24;
const MAX_PAGES = 50;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: Frequency }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.8, changeFrequency: "daily" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/legal/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/legal/privacy", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  
  // Site URL fallback
  const siteUrl = config.siteUrl || "https://evalora.vercel.app";

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  const authorIds = new Set<string>();

  try {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const result = await fetchPosts({ page, limit: PAGE_SIZE });

      // If the API returns nothing or fails, break gracefully
      if (!result || !result.posts) break;

      for (const post of result.posts) {
        if (post?.author?.id) {
          authorIds.add(post.author.id);
        }
        
        entries.push({
          url: `${siteUrl}/blog/${post.slug}`,
          lastModified: new Date(post.publishedAt ?? post.createdAt),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }

      if (!result.meta || page >= result.meta.totalPage) break;
    }

    for (const id of authorIds) {
      entries.push({
        url: `${siteUrl}/blog/author/${id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.4,
      });
    }
  } catch (error) {
    console.error("Failed to generate dynamic sitemap entries:", error);
  }

  return entries;
}