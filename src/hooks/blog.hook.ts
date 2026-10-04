import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBlogCategory,
  createBlogPost,
  deleteBlogCategory,
  deleteBlogPost,
  getAdminBlogPost,
  getAdminBlogPosts,
  getBlogCategories,
  publishBlogPost,
  unpublishBlogPost,
  updateBlogCategory,
  updateBlogPost,
  uploadBlogCover,
} from "@/api";
import type { BlogAdminListParams, BlogCategoryPayload, BlogPostPayload } from "@/types";

function useInvalidateBlog() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    void queryClient.invalidateQueries({ queryKey: ["blog"] });
  };
}

export function useAdminBlogPosts(params: BlogAdminListParams) {
  return useQuery({
    queryKey: ["admin", "blog", "posts", params],
    queryFn: () => getAdminBlogPosts(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminBlogPost(id: string) {
  return useQuery({
    queryKey: ["admin", "blog", "post", id],
    queryFn: () => getAdminBlogPost(id),
    enabled: !!id,
    retry: false,
  });
}

export function useCreateBlogPost() {
  const invalidate = useInvalidateBlog();
  return useMutation({
    mutationFn: (payload: BlogPostPayload) => createBlogPost(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateBlogPost() {
  const invalidate = useInvalidateBlog();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BlogPostPayload> }) =>
      updateBlogPost(id, payload),
    onSuccess: invalidate,
  });
}

export function usePublishBlogPost() {
  const invalidate = useInvalidateBlog();
  return useMutation({ mutationFn: publishBlogPost, onSuccess: invalidate });
}

export function useUnpublishBlogPost() {
  const invalidate = useInvalidateBlog();
  return useMutation({ mutationFn: unpublishBlogPost, onSuccess: invalidate });
}

export function useDeleteBlogPost() {
  const invalidate = useInvalidateBlog();
  return useMutation({ mutationFn: deleteBlogPost, onSuccess: invalidate });
}

export function useBlogCategories() {
  return useQuery({ queryKey: ["blog", "categories"], queryFn: getBlogCategories });
}

export function useCreateBlogCategory() {
  const invalidate = useInvalidateBlog();
  return useMutation({
    mutationFn: (payload: BlogCategoryPayload) => createBlogCategory(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateBlogCategory() {
  const invalidate = useInvalidateBlog();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BlogCategoryPayload> }) =>
      updateBlogCategory(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteBlogCategory() {
  const invalidate = useInvalidateBlog();
  return useMutation({ mutationFn: deleteBlogCategory, onSuccess: invalidate });
}

export function useUploadBlogCover() {
  return useMutation({ mutationFn: (file: File) => uploadBlogCover(file) });
}