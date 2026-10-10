"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Newspaper, Pencil, Trash2 } from "lucide-react";

import type { BlogPostStatus } from "@/types";
import {
  useAdminBlogPosts,
  useDebounce,
  useDeleteBlogPost,
  usePublishBlogPost,
  useUnpublishBlogPost,
} from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { formatBlogDate } from "@/lib/blog";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePagination } from "@/components/ui/table-pagination";
import { BLOG_STATUS_CLASS, BLOG_STATUS_LABEL } from "./status";

const STATUS_FILTERS: BlogPostStatus[] = ["PUBLISHED", "DRAFT", "ARCHIVED"];
const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

export function BlogPostsTable() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BlogPostStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const { data, isPending, isError } = useAdminBlogPosts({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: status === "ALL" ? undefined : status,
  });

  const publishMutation = usePublishBlogPost();
  const unpublishMutation = useUnpublishBlogPost();
  const deleteMutation = useDeleteBlogPost();

  async function handlePublish(id: string, title: string) {
    setBusyId(id);
    try {
      await publishMutation.mutateAsync(id);
      notify.success("Post published", `"${title}" is now live.`);
    } catch (error) {
      notify.error("Couldn't publish", isApiError(error) ? error.message : undefined);
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnpublish(id: string, title: string) {
    if (!window.confirm(`Unpublish "${title}"? It will disappear from the public blog.`)) return;
    setBusyId(id);
    try {
      await unpublishMutation.mutateAsync(id);
      notify.success("Moved back to draft");
    } catch (error) {
      notify.error("Couldn't unpublish", isApiError(error) ? error.message : undefined);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? It will be removed from the blog.`)) return;
    setBusyId(id);
    try {
      await deleteMutation.mutateAsync(id);
      notify.success("Post deleted");
    } catch (error) {
      notify.error("Couldn't delete post", isApiError(error) ? error.message : undefined);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by title..."
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as BlogPostStatus | "ALL");
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter by status"
        >
          <option value="ALL">All statuses</option>
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {BLOG_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {SKELETON_KEYS.map((id) => (
            <Skeleton key={id} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load posts. Try refreshing the page.
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          icon={Newspaper}
          title="No posts found"
          description="Write your first article or adjust the filters."
          action={{ label: "New post", onClick: () => router.push("/admin/blog/new") }}
        />
      ) : (
        <>
          <div className="card-evalora overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Published / created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.data.map((post) => {
                  const busy = busyId === post.id;
                  return (
                    <tr key={post.id} className="interactive border-b border-border last:border-0 hover:bg-accent/50">
                      <td className="max-w-xs px-4 py-3">
                        <Link href={`/admin/blog/${post.id}`} className="block truncate font-medium hover:text-primary">
                          {post.title}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">
                          {post.author.name} · {post.readingTimeMinutes} min read
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{post.category.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${BLOG_STATUS_CLASS[post.status]}`}
                        >
                          {BLOG_STATUS_LABEL[post.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatBlogDate(post.publishedAt ?? post.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {post.status === "PUBLISHED" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => handleUnpublish(post.id, post.title)}
                              >
                                Unpublish
                              </Button>
                              <Link
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                                aria-label={`View ${post.title} on the site`}
                              >
                                <ExternalLink className="size-4" aria-hidden="true" />
                              </Link>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              disabled={busy}
                              isLoading={busy && publishMutation.isPending}
                              onClick={() => handlePublish(post.id, post.title)}
                            >
                              Publish
                            </Button>
                          )}
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                            aria-label={`Edit ${post.title}`}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDelete(post.id, post.title)}
                            className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                            aria-label={`Delete ${post.title}`}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <TablePagination
            page={data.meta?.page ?? page}
            totalPages={data.meta?.totalPage ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}