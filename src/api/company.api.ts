import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  Company,
  RegisterCompanyPayload,
  Subscription,
  SubscriptionPlan,
  UpdateCompanyPayload,
} from "@/types";

export function registerCompany(payload: RegisterCompanyPayload) {
  return apiClient<ApiResponse<Company>>("/companies/register", {
    method: "POST",
    body: payload,
  });
}

export function getMyCompany() {
  return apiClient<ApiResponse<Company>>("/companies/me");
}

export function updateMyCompany(payload: UpdateCompanyPayload) {
  const formData = new FormData();
  if (payload.description !== undefined) formData.append("description", payload.description);
  if (payload.website !== undefined) formData.append("website", payload.website);
  if (payload.industry !== undefined) formData.append("industry", payload.industry);
  if (payload.logo) formData.append("logo", payload.logo);

  return apiClient<ApiResponse<Company>>("/companies/me", {
    method: "PATCH",
    body: formData,
  });
}

export function getMySubscription() {
  return apiClient<ApiResponse<Subscription>>("/companies/me/subscription");
}

export function updateMySubscription(plan: SubscriptionPlan) {
  return apiClient<ApiResponse<Subscription>>("/companies/me/subscription", {
    method: "PATCH",
    body: { plan },
  });
}

export function cancelMySubscription() {
  return apiClient<ApiResponse<Subscription>>("/companies/me/subscription/cancel", {
    method: "POST",
  });
}