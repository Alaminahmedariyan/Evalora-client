"use client";

import { notFound, useParams } from "next/navigation";

import { useAdminBlogPost } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogPostForm } from "@/components/module/blog-admin";

export default function AdminEditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError } = useAdminBlogPost(id);

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
        <p className="text-sm text-muted-foreground">{data.data.title}</p>
      </div>
      <BlogPostForm key={data.data.id} post={data.data} />
    </div>
  );
}