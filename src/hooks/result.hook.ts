import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { computeRanks, getResultByAttemptId, getResultsForAssessment, releaseAssessmentResults } from "@/api";

export function useResultByAttempt(attemptId: string) {
  return useQuery({
    queryKey: ["result", "attempt", attemptId],
    queryFn: () => getResultByAttemptId(attemptId),
    enabled: !!attemptId,
    retry: false, // a not-yet-finalized attempt legitimately 404s here
  });
}

export function useResultsForAssessment(assessmentId: string) {
  return useQuery({
    queryKey: ["results", "assessment", assessmentId],
    queryFn: () => getResultsForAssessment(assessmentId),
    enabled: !!assessmentId,
  });
}

export function useComputeRanks(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => computeRanks(assessmentId),
    onSuccess: () => {
      // computeRanks only returns a count, not the updated leaderboard —
      // refetch to actually see the new rank numbers.
      void queryClient.invalidateQueries({ queryKey: ["results", "assessment", assessmentId] });
    },
  });
}

export function useReleaseResults(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => releaseAssessmentResults(assessmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });
      void queryClient.invalidateQueries({ queryKey: ["assessments"] });
      void queryClient.invalidateQueries({ queryKey: ["results"] });
      void queryClient.invalidateQueries({ queryKey: ["result"] });
    },
  });
}