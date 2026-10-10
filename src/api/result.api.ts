import apiClient from "@/lib/apiClient";
import type { ApiResponse, ComputeRanksResult, ReleaseResultsResult, Result } from "@/types";

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

export function releaseAssessmentResults(assessmentId: string) {
  return apiClient<ApiResponse<ReleaseResultsResult>>(`/results/assessments/${assessmentId}/release`, {
    method: "PATCH",
  });
}