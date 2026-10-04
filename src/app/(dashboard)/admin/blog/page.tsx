import Link from "next/link";
import { Plus, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BlogPostsTable } from "@/components/module/blog-admin";

export default function AdminBlogPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
          <p className="text-sm text-muted-foreground">Write, publish and manage articles.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/blog/categories">
              <Tags className="size-4" aria-hidden="true" />
              Categories
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/blog/new">
              <Plus className="size-4" aria-hidden="true" />
              New post
            </Link>
          </Button>
        </div>
      </div>
      <BlogPostsTable />
    </div>
  );
}