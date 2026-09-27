import apiClient from "@/lib/apiClient";
import type { ApiResponse, ComputeRanksResult, Result } from "@/types";

export function getResultByAttemptId(attemptId: string) {
  return apiClient<ApiResponse<Result>>(`/results/attempts/${attemptId}`);
}

export function getResultsForAssessment(assessmentId: string) {
  return apiClient<ApiResponse<Result[]>>(`/results/assessments/${assessmentId}`);
}

export function computeRanks(assessmentId: string) {
  return apiClient<ApiResponse<ComputeRanksResult>>(`/results/assessments/${assessmentId}/compute-ranks`, {
    method: "POST",
  });
}