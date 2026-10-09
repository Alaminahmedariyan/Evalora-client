import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { evaluateSubmission, getPendingEvaluations, getSubmissionById, getSubmissionsForAttempt } from "@/api";
import type { ApiResponse, GradingSubmission, ManualEvaluationPayload } from "@/types";

export function useSubmissionsForAttempt(attemptId: string) {
  return useQuery({
    queryKey: ["evaluation", "attempt", attemptId],
    queryFn: () => getSubmissionsForAttempt(attemptId),
    enabled: !!attemptId,
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: ["evaluation", "submission", id],
    queryFn: () => getSubmissionById(id),
    enabled: !!id,
  });
}

export function usePendingEvaluations(assessmentId: string) {
  return useQuery({
    queryKey: ["evaluation", "pending", assessmentId],
    queryFn: () => getPendingEvaluations(assessmentId),
    enabled: !!assessmentId,
  });
}

export function useEvaluateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ManualEvaluationPayload }) => evaluateSubmission(id, payload),
    onSuccess: (res) => {
      // Take the graded submission out of every cached grading queue right
      // away. The refetch below takes a moment, and in that gap "Save & next"
      // would otherwise offer the submission that was just graded.
      queryClient.setQueriesData<ApiResponse<GradingSubmission[]>>(
        { queryKey: ["evaluation", "pending"] },
        (old) => (old ? { ...old, data: old.data.filter((submission) => submission.id !== res.data.id) } : old),
      );

      void queryClient.invalidateQueries({ queryKey: ["evaluation", "submission", res.data.id] });
      void queryClient.invalidateQueries({ queryKey: ["evaluation", "pending"] });
      void queryClient.invalidateQueries({ queryKey: ["evaluation", "attempt", res.data.attemptId] });
      // Grading changes the attempt's Result, so its cached score is now stale.
      void queryClient.invalidateQueries({ queryKey: ["result"] });
      void queryClient.invalidateQueries({ queryKey: ["results"] });
    },
  });
}