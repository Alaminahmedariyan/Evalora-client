"use client";

import { useState } from "react";
import { Pencil, Tags, Trash2 } from "lucide-react";

import type { BlogCategory } from "@/types";
import {
  useBlogCategories,
  useCreateBlogCategory,
  useDeleteBlogCategory,
  useUpdateBlogCategory,
} from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { blogCategorySchema } from "@/validation/blog.validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function BlogCategoriesManager() {
  const { data, isPending, isError } = useBlogCategories();
  const createMutation = useCreateBlogCategory();
  const updateMutation = useUpdateBlogCategory();
  const deleteMutation = useDeleteBlogCategory();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = blogCategorySchema.safeParse({
      name,
      description,
    });

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ?? "Please check the fields.",
      );
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: parsed.data.name,
        ...(parsed.data.description
          ? { description: parsed.data.description }
          : {}),
      });

      notify.success("Category created");
      setName("");
      setDescription("");
    } catch (error) {
      setFormError(
        isApiError(error)
          ? error.message
          : "Couldn't create the category.",
      );
    }
  }

  function startEdit(category: BlogCategory) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description ?? "");
    setEditError(null);
  }

  async function handleSaveEdit(id: string) {
    setEditError(null);

    const parsed = blogCategorySchema.safeParse({
      name: editName,
      description: editDescription,
    });

    if (!parsed.success) {
      setEditError(
        parsed.error.issues[0]?.message ?? "Please check the fields.",
      );
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id,
        payload: parsed.data,
      });

      notify.success("Category updated");
      setEditingId(null);
    } catch (error) {
      setEditError(
        isApiError(error)
          ? error.message
          : "Couldn't update the category.",
      );
    }
  }

  async function handleDelete(category: BlogCategory) {
    if (!window.confirm(`Delete the "${category.name}" category?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(category.id);
      notify.success("Category deleted");
    } catch (error) {
      notify.error(
        "Couldn't delete category",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleCreate}
        className="card-evalora flex flex-col gap-4 p-5"
        noValidate
      >
        <h2 className="text-sm font-semibold">New category</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-description">
              Description (optional)
            </Label>
            <Input
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {formError ? (
          <p role="alert" className="text-xs text-danger">
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          size="sm"
          className="self-start"
          isLoading={createMutation.isPending}
        >
          Add category
        </Button>
      </form>

      {isPending ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load categories. Try refreshing the page.
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Create your first category to start writing posts."
        />
      ) : (
        <ul className="card-evalora divide-y divide-border">
          {data.data.map((category) => (
            <li key={category.id} className="p-4">
              {editingId === category.id ? (
                <div className="flex flex-col gap-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      aria-label="Category name"
                    />

                    <Input
                      value={editDescription}
                      onChange={(e) =>
                        setEditDescription(e.target.value)
                      }
                      placeholder="Description"
                      aria-label="Category description"
                    />
                  </div>

                  {editError ? (
                    <p role="alert" className="text-xs text-danger">
                      {editError}
                    </p>
                  ) : null}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void handleSaveEdit(category.id)}
                      isLoading={updateMutation.isPending}
                    >
                      Save
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {category.name}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {category.postCount} published · /blog?category=
                      {category.slug}
                      {category.description
                        ? ` · ${category.description}`
                        : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => startEdit(category)}
                    className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label={`Edit ${category.name}`}
                  >
                    <Pencil
                      className="size-4"
                      aria-hidden="true"
                    />
                  </button>

                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => void handleDelete(category)}
                    className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                    aria-label={`Delete ${category.name}`}
                  >
                    <Trash2
                      className="size-4"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
