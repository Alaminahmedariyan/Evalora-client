"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, ImagePlus, Trash2 } from "lucide-react";

import type { BlogPostDetail } from "@/types";
import {
  useBlogCategories,
  useCreateBlogPost,
  usePublishBlogPost,
  useUnpublishBlogPost,
  useUpdateBlogPost,
  useUploadBlogCover,
} from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  MAX_BLOG_TAGS,
  blogPostFormSchema,
  parseTagInput,
  type BlogPostFormValues,
} from "@/validation/blog.validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlogContent } from "@/components/module/blog";
import { BLOG_STATUS_CLASS, BLOG_STATUS_LABEL } from "./status";

const COVER_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const COVER_MAX_BYTES = 5 * 1024 * 1024;

const TEXTAREA_CLASS =
  "interactive w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Action = "draft" | "publish" | "unpublish";

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>

      {children}

      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function BlogPostForm({ post }: { post?: BlogPostDetail }) {
  const router = useRouter();

  const { data: categoriesData, isPending: categoriesPending } =
    useBlogCategories();

  const categories = categoriesData?.data ?? [];

  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();
  const publishMutation = usePublishBlogPost();
  const unpublishMutation = useUnpublishBlogPost();
  const uploadMutation = useUploadBlogCover();

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [categoryId, setCategoryId] = useState(post?.category.id ?? "");
  const [tagsRaw, setTagsRaw] = useState(
    post?.tags.map((tag) => tag.name).join(", ") ?? "",
  );
  const [coverImage, setCoverImage] = useState<string | null>(
    post?.coverImage ?? null,
  );

  const [mode, setMode] = useState<"write" | "preview">("write");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [action, setAction] = useState<Action | null>(null);
  const [dirty, setDirty] = useState(false);

  const busy = action !== null;

  // Warn before a refresh or tab close throws away unsaved writing.
  useEffect(() => {
    if (!dirty) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handler);

    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [dirty]);

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(words / 200));

  function edit<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setDirty(true);
    };
  }

  function validate(): BlogPostFormValues | null {
    const parsed = blogPostFormSchema.safeParse({
      title,
      excerpt,
      content,
      categoryId,
      tags: parseTagInput(tagsRaw),
    });

    if (parsed.success) {
      setErrors({});
      return parsed.data;
    }

    const next: Record<string, string> = {};

    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");

      if (!next[key]) {
        next[key] = issue.message;
      }
    }

    setErrors(next);
    return null;
  }

  async function handleCoverFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    // Allow selecting the same file again after an unsuccessful attempt.
    event.target.value = "";

    if (!file) return;

    if (!COVER_TYPES.includes(file.type)) {
      notify.error(
        "Unsupported image",
        "Use a JPG, PNG, WebP or GIF image.",
      );
      return;
    }

    if (file.size > COVER_MAX_BYTES) {
      notify.error(
        "Image is too large",
        "Choose an image under 5 MB.",
      );
      return;
    }

    try {
      const response = await uploadMutation.mutateAsync(file);

      setCoverImage(response.data.url);
      setDirty(true);
    } catch (error) {
      notify.error(
        "Couldn't upload image",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  async function publishAfterSave(
    id: string,
    errorMessage: string,
  ): Promise<boolean> {
    try {
      await publishMutation.mutateAsync(id);

      notify.success("Post published");
      return true;
    } catch (error) {
      notify.error(
        errorMessage,
        isApiError(error) ? error.message : undefined,
      );

      return false;
    }
  }

  async function handleSave(publish: boolean) {
    const values = validate();

    if (!values) return;

    setAction(publish ? "publish" : "draft");

    try {
      if (post) {
        await updateMutation.mutateAsync({
          id: post.id,
          payload: {
            ...values,
            coverImage,
          },
        });

        setDirty(false);

        if (publish && post.status !== "PUBLISHED") {
          await publishAfterSave(
            post.id,
            "Saved, but couldn't publish",
          );
        } else {
          notify.success("Changes saved");
        }

        return;
      }

      const response = await createMutation.mutateAsync({
        ...values,
        ...(coverImage ? { coverImage } : {}),
      });

      setDirty(false);

      if (publish) {
        await publishAfterSave(
          response.data.id,
          "Saved as a draft, but couldn't publish",
        );
      } else {
        notify.success("Draft saved");
      }

      router.replace(`/admin/blog/${response.data.id}`);
    } catch (error) {
      notify.error(
        "Couldn't save post",
        isApiError(error) ? error.message : undefined,
      );
    } finally {
      setAction(null);
    }
  }

  async function handleUnpublish() {
    if (!post) return;

    const confirmed = window.confirm(
      "Unpublish this post? It will disappear from the public blog.",
    );

    if (!confirmed) return;

    setAction("unpublish");

    try {
      await unpublishMutation.mutateAsync(post.id);

      notify.success("Moved back to draft");
    } catch (error) {
      notify.error(
        "Couldn't unpublish",
        isApiError(error) ? error.message : undefined,
      );
    } finally {
      setAction(null);
    }
  }

  const isPublished = post?.status === "PUBLISHED";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave(false);
      }}
      className="flex flex-col gap-6"
      noValidate
    >
      {post ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${BLOG_STATUS_CLASS[post.status]}`}
          >
            {BLOG_STATUS_LABEL[post.status]}
          </span>

          {isPublished ? (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              View on site
              <ExternalLink
                className="size-3.5"
                aria-hidden="true"
              />
            </Link>
          ) : null}

          <span className="text-xs text-muted-foreground">
            The URL (/blog/{post.slug}) stays the same even if you
            change the title.
          </span>
        </div>
      ) : null}

      <Field id="blog-title" label="Title" error={errors.title}>
        <Input
          id="blog-title"
          value={title}
          onChange={(event) => edit(setTitle)(event.target.value)}
          placeholder="A clear, specific headline"
          aria-invalid={Boolean(errors.title)}
        />
      </Field>

      <Field
        id="blog-excerpt"
        label="Excerpt"
        hint={`Shown on cards and in search results. ${excerpt.trim().length}/300`}
        error={errors.excerpt}
      >
        <textarea
          id="blog-excerpt"
          value={excerpt}
          onChange={(event) => edit(setExcerpt)(event.target.value)}
          rows={3}
          className={TEXTAREA_CLASS}
          aria-invalid={Boolean(errors.excerpt)}
        />
      </Field>

      <div className="grid gap-6 md:grid-cols-2">
        <Field
          id="blog-category"
          label="Category"
          error={errors.categoryId}
        >
          <select
            id="blog-category"
            value={categoryId}
            onChange={(event) =>
              edit(setCategoryId)(event.target.value)
            }
            disabled={categoriesPending}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            aria-invalid={Boolean(errors.categoryId)}
          >
            <option value="">
              {categoriesPending
                ? "Loading..."
                : "Select a category"}
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {!categoriesPending && categories.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No categories yet.{" "}
              <Link
                href="/admin/blog/categories"
                className="text-primary hover:underline"
              >
                Create one first
              </Link>
              .
            </p>
          ) : null}
        </Field>

        <Field
          id="blog-tags"
          label="Tags"
          hint={`Comma-separated, up to ${MAX_BLOG_TAGS}.`}
          error={errors.tags}
        >
          <Input
            id="blog-tags"
            value={tagsRaw}
            onChange={(event) => edit(setTagsRaw)(event.target.value)}
            placeholder="hiring, proctoring, checklist"
            aria-invalid={Boolean(errors.tags)}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Cover image</Label>

        {coverImage ? (
          <div className="flex flex-wrap items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt="Cover preview"
              className="aspect-video w-64 rounded-lg border border-border object-cover"
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCoverImage(null);
                setDirty(true);
              }}
            >
              <Trash2
                className="size-3.5"
                aria-hidden="true"
              />
              Remove
            </Button>
          </div>
        ) : (
          <label
            className={cn(
              "interactive flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:bg-accent",
              uploadMutation.isPending &&
                "pointer-events-none opacity-60",
            )}
          >
            <ImagePlus
              className="size-4"
              aria-hidden="true"
            />

            {uploadMutation.isPending
              ? "Uploading..."
              : "Upload an image (JPG, PNG, WebP or GIF, up to 5 MB)"}

            <input
              type="file"
              accept={COVER_TYPES.join(",")}
              onChange={(event) => void handleCoverFile(event)}
              className="sr-only"
            />
          </label>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="blog-content">
            Content (Markdown)
          </Label>

          {/* Accessibility fix: use fieldset and legend for the related controls. */}
          <fieldset className="m-0 flex min-w-0 gap-1 border-0 p-0 lg:hidden">
            <legend className="sr-only">Editor view</legend>

            {(["write", "preview"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={mode === value ? "default" : "outline"}
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
              >
                {value === "write" ? "Write" : "Preview"}
              </Button>
            ))}
          </fieldset>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div
            className={cn(
              "flex flex-col gap-1.5",
              mode === "preview" && "hidden lg:flex",
            )}
          >
            <textarea
              id="blog-content"
              value={content}
              onChange={(event) =>
                edit(setContent)(event.target.value)
              }
              rows={22}
              spellCheck
              className={cn(
                TEXTAREA_CLASS,
                "font-mono leading-relaxed",
              )}
              placeholder={
                "## A heading\n\nWrite in Markdown. **Bold**, lists, links, code blocks and tables are supported."
              }
              aria-invalid={Boolean(errors.content)}
            />

            {errors.content ? (
              <p role="alert" className="text-xs text-danger">
                {errors.content}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {words} words · about {readingMinutes} min read
              </p>
            )}
          </div>

          <div
            className={cn(
              "card-evalora max-h-[36rem] overflow-y-auto p-5",
              mode === "write" && "hidden lg:block",
            )}
          >
            {content.trim() ? (
              <BlogContent markdown={content} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing to preview yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        {isPublished ? (
          <>
            <Button
              type="submit"
              isLoading={action === "draft"}
              disabled={busy}
            >
              Save changes
            </Button>

            <Button
              type="button"
              variant="outline"
              isLoading={action === "unpublish"}
              disabled={busy}
              onClick={() => void handleUnpublish()}
            >
              Unpublish
            </Button>
          </>
        ) : (
          <>
            <Button
              type="submit"
              variant="outline"
              isLoading={action === "draft"}
              disabled={busy}
            >
              Save draft
            </Button>

            <Button
              type="button"
              isLoading={action === "publish"}
              disabled={busy}
              onClick={() => void handleSave(true)}
            >
              Save &amp; publish
            </Button>
          </>
        )}

        <Button asChild type="button" variant="ghost">
          <Link href="/admin/blog">Back to posts</Link>
        </Button>

        {dirty ? (
          <span className="text-xs text-muted-foreground">
            Unsaved changes
          </span>
        ) : null}
      </div>
    </form>
  );
}