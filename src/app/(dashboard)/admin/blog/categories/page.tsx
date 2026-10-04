import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BlogCategoriesManager } from "@/components/module/blog-admin";

export default function AdminBlogCategoriesPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/admin/blog"
          className="interactive mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to posts
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Blog categories</h1>
        <p className="text-sm text-muted-foreground">
          Every post belongs to exactly one category. A category with posts can&apos;t be deleted.
        </p>
      </div>
      <BlogCategoriesManager />
    </div>
  );
}