import { fetchPosts } from "@/lib/blog-server";
import { config } from "@/lib/config";

export const revalidate = 600;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const result = await fetchPosts({ limit: 20 });

  // A broken feed would make subscribers see an empty or stale blog, so a
  // temporary failure is reported as such instead of an empty feed.
  if (!result) {
    return new Response("The feed is temporarily unavailable.", {
      status: 503,
      headers: { "Retry-After": "300" },
    });
  }

  const feedUrl = `${config.siteUrl}/blog/rss.xml`;
  const latest = result.posts[0];
  const lastBuildDate = new Date(latest?.publishedAt ?? Date.now()).toUTCString();

  const items = result.posts
    .map((post) => {
      const url = escapeXml(`${config.siteUrl}/blog/${post.slug}`);

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt ?? post.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.category.name)}</category>
      <dc:creator>${escapeXml(post.author.name)}</dc:creator>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Evalora Blog</title>
    <link>${escapeXml(`${config.siteUrl}/blog`)}</link>
    <description>Practical guides on coding assessments, proctoring and engineering hiring.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}