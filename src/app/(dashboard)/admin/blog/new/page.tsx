import { BlogPostForm } from "@/components/module/blog-admin";

export default function AdminNewBlogPostPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
        <p className="text-sm text-muted-foreground">Save a draft first, publish when it&apos;s ready.</p>
      </div>
      <BlogPostForm />
    </div>
  );
}