export type BlogPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface BlogMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface BlogAuthor {
  id: string;
  name: string;
  image: string | null;
}

export interface BlogAuthorProfile extends BlogAuthor {
  postCount: number;
}

export interface BlogCategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface BlogCategory extends BlogCategoryRef {
  description: string | null;
  createdAt: string;
  postCount: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogTagWithCount extends BlogTag {
  postCount: number;
}

// Matches BLOG_POST_LIST_SELECT (tags flattened by the service).
export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  status: BlogPostStatus;
  readingTimeMinutes: number;
  publishedAt: string | null;
  createdAt: string;
  author: BlogAuthor;
  category: BlogCategoryRef;
  tags: BlogTag[];
}

// Matches BLOG_POST_DETAIL_SELECT.
export interface BlogPostDetail extends BlogPostSummary {
  content: string;
  updatedAt: string;
}

// Public GET /blog/posts/:slug also returns related posts.
export interface PublicBlogPost extends BlogPostDetail {
  related: BlogPostSummary[];
}

export interface BlogListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  author?: string;
}

export interface BlogAdminListParams {
  page?: number;
  limit?: number;
  status?: BlogPostStatus;
  search?: string;
}

// coverImage: omit on create when there is none; null removes it on update.
export interface BlogPostPayload {
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string[];
  coverImage?: string | null;
}

export interface BlogCategoryPayload {
  name: string;
  description?: string;
}