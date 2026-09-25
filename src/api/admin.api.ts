import apiClient from "@/lib/apiClient";
import type { ApiResponse, DashboardStatsResponse } from "@/types";

export function getDashboardStats() {
  return apiClient<ApiResponse<DashboardStatsResponse>>("/admin/dashboard-stats");
}