import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  BlogAdminListParams,
  BlogCategory,
  BlogCategoryPayload,
  BlogPostDetail,
  BlogPostPayload,
  BlogPostSummary,
} from "@/types";

export function getAdminBlogPosts(params: BlogAdminListParams) {
  return apiClient<ApiResponse<BlogPostSummary[]>>("/blog/admin/posts", { params });
}

export function getAdminBlogPost(id: string) {
  return apiClient<ApiResponse<BlogPostDetail>>(`/blog/admin/posts/${id}`);
}

export function createBlogPost(payload: BlogPostPayload) {
  return apiClient<ApiResponse<BlogPostDetail>>("/blog/admin/posts", {
    method: "POST",
    body: payload,
  });
}

export function updateBlogPost(id: string, payload: Partial<BlogPostPayload>) {
  return apiClient<ApiResponse<BlogPostDetail>>(`/blog/admin/posts/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function publishBlogPost(id: string) {
  return apiClient<ApiResponse<BlogPostDetail>>(`/blog/admin/posts/${id}/publish`, {
    method: "PATCH",
  });
}

export function unpublishBlogPost(id: string) {
  return apiClient<ApiResponse<BlogPostDetail>>(`/blog/admin/posts/${id}/unpublish`, {
    method: "PATCH",
  });
}

export function deleteBlogPost(id: string) {
  return apiClient<ApiResponse<null>>(`/blog/admin/posts/${id}`, { method: "DELETE" });
}

export function getBlogCategories() {
  return apiClient<ApiResponse<BlogCategory[]>>("/blog/categories");
}

export function createBlogCategory(payload: BlogCategoryPayload) {
  return apiClient<ApiResponse<BlogCategory>>("/blog/admin/categories", {
    method: "POST",
    body: payload,
  });
}

export function updateBlogCategory(id: string, payload: Partial<BlogCategoryPayload>) {
  return apiClient<ApiResponse<BlogCategory>>(`/blog/admin/categories/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteBlogCategory(id: string) {
  return apiClient<ApiResponse<null>>(`/blog/admin/categories/${id}`, { method: "DELETE" });
}

export function uploadBlogCover(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  return apiClient<ApiResponse<{ url: string }>>("/blog/admin/upload-cover", {
    method: "POST",
    body: formData,
  });
}