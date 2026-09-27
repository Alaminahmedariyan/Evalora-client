import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { evaluateSubmission, getPendingEvaluations, getSubmissionById, getSubmissionsForAttempt } from "@/api";
import type { ManualEvaluationPayload } from "@/types";

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
      void queryClient.invalidateQueries({ queryKey: ["evaluation", "submission", res.data.id] });
      void queryClient.invalidateQueries({ queryKey: ["evaluation", "pending"] });
      void queryClient.invalidateQueries({ queryKey: ["evaluation", "attempt", res.data.attemptId] });
      // Grading changes the attempt's Result — its cached score is now stale.
      void queryClient.invalidateQueries({ queryKey: ["result"] });
      void queryClient.invalidateQueries({ queryKey: ["results"] });
    },
  });
}