import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteNotification,
  getMyNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/api";
import type { NotificationListParams } from "@/types";

export function useMyNotifications(params: NotificationListParams) {
  return useQuery({
    queryKey: ["notifications", "me", params],
    queryFn: () => getMyNotifications(params),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });
}

function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };
}

export function useMarkAsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: markNotificationAsRead, onSuccess: invalidate });
}

export function useMarkAllAsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: markAllNotificationsAsRead, onSuccess: invalidate });
}

export function useDeleteNotification() {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: deleteNotification, onSuccess: invalidate });
}