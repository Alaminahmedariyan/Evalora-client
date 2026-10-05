import apiClient from "@/lib/apiClient";
import type { AccountExport, ApiResponse, DeleteAccountPayload } from "@/types";

export function exportMyData() {
  return apiClient<ApiResponse<AccountExport>>("/users/me/export");
}

export function deleteMyAccount(payload: DeleteAccountPayload) {
  return apiClient<ApiResponse<null>>("/users/me/delete", {
    method: "POST",
    body: payload,
  });
}