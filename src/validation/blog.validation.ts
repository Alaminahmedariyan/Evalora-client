import { z } from "zod";

export const MAX_BLOG_TAGS = 8;

/** "a, b ,  A" -> ["a", "b"] (case-insensitive de-duplication). */
export function parseTagInput(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const part of raw.split(",")) {
    const name = part.trim().replace(/\s+/g, " ");
    const key = name.toLowerCase();

    if (name && !seen.has(key)) {
      seen.add(key);
      tags.push(name);
    }
  }

  return tags;
}

export const blogPostFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(160, "Title must be at most 160 characters."),
  excerpt: z
    .string()
    .trim()
    .min(20, "Excerpt must be at least 20 characters.")
    .max(300, "Excerpt must be at most 300 characters."),
  content: z
    .string()
    .trim()
    .min(100, "Content must be at least 100 characters.")
    .max(100000, "Content is too long."),
  categoryId: z.string().min(1, "Choose a category."),
  tags: z
    .array(
      z
        .string()
        .min(2, "Each tag must be at least 2 characters.")
        .max(30, "Each tag must be at most 30 characters."),
    )
    .max(MAX_BLOG_TAGS, `Use at most ${MAX_BLOG_TAGS} tags.`),
});

export type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

export const blogCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be at most 50 characters."),
  description: z.string().trim().max(300, "Description must be at most 300 characters."),
});