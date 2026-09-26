import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  CreateProblemPayload,
  ProblemDetail,
  ProblemListItem,
  ProblemListParams,
} from "@/types";

export function createProblem(payload: CreateProblemPayload) {
  return apiClient<ApiResponse<ProblemDetail>>("/problems", {
    method: "POST",
    body: payload,
  });
}

export function getAllProblems(params: ProblemListParams) {
  return apiClient<ApiResponse<ProblemListItem[]>>("/problems", { params });
}

export function getProblemById(id: string) {
  return apiClient<ApiResponse<ProblemDetail>>(`/problems/${id}`);
}

export function deleteProblem(id: string) {
  return apiClient<ApiResponse<null>>(`/problems/${id}`, { method: "DELETE" });
}

import type { UpdateProblemPayload } from "@/types"; // add to the existing type-only import line above

export function updateProblem(id: string, payload: UpdateProblemPayload) {
  return apiClient<ApiResponse<ProblemDetail>>(`/problems/${id}`, {
    method: "PATCH",
    body: payload,
  });
}