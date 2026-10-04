import { config } from "@/lib/config";
import type {
  BlogAuthorProfile,
  BlogCategory,
  BlogListParams,
  BlogMeta,
  BlogPostSummary,
  BlogTagWithCount,
  PublicBlogPost,
} from "@/types";

// A newly published post can take up to this long to show up publicly.
const REVALIDATE_SECONDS = 60;

type Envelope<T> = { success: boolean; message: string; data: T; meta?: BlogMeta };

/** Returns null on 404, throws on any other failure. */
async function blogGet<T>(path: string): Promise<Envelope<T> | null> {
  const res = await fetch(`${config.apiBaseUrl}/blog${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Blog API responded ${res.status} for ${path}`);

  return (await res.json()) as Envelope<T>;
}

function toQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/** null means the request failed (so the page can show an error state). */
export async function fetchPosts(
  params: BlogListParams,
): Promise<{ posts: BlogPostSummary[]; meta: BlogMeta } | null> {
  try {
    const body = await blogGet<BlogPostSummary[]>(
      `/posts${toQuery({ ...params })}`,
    );

    if (!body) return null;

    return {
      posts: body.data,
      meta: body.meta ?? {
        page: params.page ?? 1,
        limit: body.data.length,
        total: body.data.length,
        totalPage: 1,
      },
    };
  } catch {
    return null;
  }
}

/** null means "not found"; other failures throw. */
export async function fetchPost(slug: string): Promise<PublicBlogPost | null> {
  const body = await blogGet<PublicBlogPost>(`/posts/${encodeURIComponent(slug)}`);
  return body?.data ?? null;
}

export async function fetchCategories(): Promise<BlogCategory[]> {
  try {
    return (await blogGet<BlogCategory[]>("/categories"))?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchTags(): Promise<BlogTagWithCount[]> {
  try {
    return (await blogGet<BlogTagWithCount[]>("/tags"))?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchAuthor(id: string): Promise<BlogAuthorProfile | null> {
  try {
    return (await blogGet<BlogAuthorProfile>(`/authors/${encodeURIComponent(id)}`))?.data ?? null;
  } catch {
    return null;
  }
}