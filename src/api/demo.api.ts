import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types";

export type DemoRole = "CANDIDATE" | "RECRUITER" | "ADMIN";

export function demoLogin(payload: { role: DemoRole }) {
  return apiClient<ApiResponse<unknown>>("/demo/login", {
    method: "POST",
    body: payload,
  });
}