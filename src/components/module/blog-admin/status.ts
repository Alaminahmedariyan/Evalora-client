import type { BlogPostStatus } from "@/types";

export const BLOG_STATUS_CLASS: Record<BlogPostStatus, string> = {
  PUBLISHED: "status-success",
  DRAFT: "status-neutral",
  ARCHIVED: "status-archived",
};

export const BLOG_STATUS_LABEL: Record<BlogPostStatus, string> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};