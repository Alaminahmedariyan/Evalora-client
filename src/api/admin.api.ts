import apiClient from "@/lib/apiClient";
import type { ApiResponse, AuditLog, AuditLogListParams, DashboardStatsResponse } from "@/types";

export function getDashboardStats() {
  return apiClient<ApiResponse<DashboardStatsResponse>>("/admin/dashboard-stats");
}

export function getAuditLogs(params: AuditLogListParams) {
  return apiClient<ApiResponse<AuditLog[]>>("/admin/audit-logs", { params });
}