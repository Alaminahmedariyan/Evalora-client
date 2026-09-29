import apiClient from "@/lib/apiClient";
import type { ApiResponse, Notification, NotificationListParams } from "@/types";

export function getMyNotifications(params: NotificationListParams) {
  return apiClient<ApiResponse<Notification[]>>("/notifications/me", { params });
}

export function getUnreadCount() {
  return apiClient<ApiResponse<{ unreadCount: number }>>("/notifications/unread-count");
}

export function markNotificationAsRead(id: string) {
  return apiClient<ApiResponse<Notification>>(`/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsAsRead() {
  return apiClient<ApiResponse<{ updated: number }>>("/notifications/read-all", { method: "PATCH" });
}

export function deleteNotification(id: string) {
  return apiClient<ApiResponse<null>>(`/notifications/${id}`, { method: "DELETE" });
}