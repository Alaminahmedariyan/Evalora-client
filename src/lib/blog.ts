export type BlogHrefParams = {
  page?: number;
  category?: string;
  tag?: string;
  search?: string;
};

/** Builds a /blog URL; page 1 and empty filters are omitted for clean links. */
export function buildBlogHref(params: BlogHrefParams): string {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.tag) query.set("tag", params.tag);
  if (params.page && params.page > 1) query.set("page", String(params.page));

  const qs = query.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export function formatBlogDate(iso: string | null): string {
  if (!iso) return "";

  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}