import apiClient from "@/lib/apiClient";
import type { ApiResponse, UserListItem, UserListParams, UserRole, UserStatus } from "@/types";

export function getAllUsers(params: UserListParams) {
  return apiClient<ApiResponse<UserListItem[]>>("/users", { params });
}

export function getUserById(id: string) {
  return apiClient<ApiResponse<UserListItem>>(`/users/${id}`);
}

export function updateUserRole(id: string, role: UserRole) {
  return apiClient<ApiResponse<Pick<UserListItem, "id" | "name" | "email" | "role">>>(`/users/${id}/role`, {
    method: "PATCH",
    body: { role },
  });
}

export function updateUserStatus(id: string, status: UserStatus) {
  return apiClient<ApiResponse<Pick<UserListItem, "id" | "name" | "email" | "status">>>(`/users/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function deleteUser(id: string) {
  return apiClient<ApiResponse<null>>(`/users/${id}`, { method: "DELETE" });
}