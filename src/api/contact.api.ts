import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  ContactListParams,
  ContactMessage,
  ContactMessageStatus,
  ContactPayload,
} from "@/types";

export function sendContactMessage(payload: ContactPayload) {
  return apiClient<ApiResponse<{ received: boolean }>>("/contact", {
    method: "POST",
    body: payload,
  });
}

export function getContactMessages(params: ContactListParams) {
  return apiClient<ApiResponse<ContactMessage[]>>("/contact/admin/messages", { params });
}

export function updateContactMessageStatus(id: string, status: ContactMessageStatus) {
  return apiClient<ApiResponse<ContactMessage>>(`/contact/admin/messages/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function deleteContactMessage(id: string) {
  return apiClient<ApiResponse<null>>(`/contact/admin/messages/${id}`, { method: "DELETE" });
}