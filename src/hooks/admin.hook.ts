import {
  getAllUsers,
  getDashboardStats,
  deleteUser,
  updateUserRole,
  updateUserStatus,
  getAuditLogs,
} from "@/api";
import type { AuditLogListParams, UserListParams, UserRole, UserStatus } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: getDashboardStats,
  });
}

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => getAllUsers(params),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });
}

export function useAuditLogs(params: AuditLogListParams) {
  return useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: () => getAuditLogs(params),
  });
}