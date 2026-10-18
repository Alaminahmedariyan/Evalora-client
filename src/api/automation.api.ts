import apiClient from "@/lib/apiClient";
import type { ApiResponse, AutomationEvent, AutomationEventListParams, AutomationStats } from "@/types";

export function getAutomationEvents(params: AutomationEventListParams) {
  return apiClient<ApiResponse<AutomationEvent[]>>("/admin/automation/events", { params });
}

export function getAutomationStats() {
  return apiClient<ApiResponse<AutomationStats>>("/admin/automation/stats");
}

export function retryAutomationEvent(id: string) {
  return apiClient<ApiResponse<AutomationEvent>>(`/admin/automation/events/${id}/retry`, {
    method: "POST",
  });
}