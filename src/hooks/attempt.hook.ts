import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAttemptById,
  getMyAttempts,
  getProctoringEvents,
  recordProctoringEvent,
  saveSubmission,
  startAttempt,
  submitAttempt,
} from "@/api";
import type { ProctoringEventPayload, SaveSubmissionPayload } from "@/types";

export function useMyAttempts() {
  return useQuery({ queryKey: ["attempts", "me"], queryFn: getMyAttempts });
}

export function useAttempt(id: string, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["attempt", id],
    queryFn: () => getAttemptById(id),
    enabled: !!id,
    refetchInterval: options?.refetchInterval,
  });
}

export function useStartAttempt() {
  return useMutation({ mutationFn: startAttempt });
}

export function useSaveSubmission(attemptId: string) {
  return useMutation({
    mutationFn: ({ problemId, payload }: { problemId: string; payload: SaveSubmissionPayload }) =>
      saveSubmission(attemptId, problemId, payload),
  });
}

export function useSubmitAttempt(attemptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submitAttempt(attemptId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["attempt", attemptId] });
      void queryClient.invalidateQueries({ queryKey: ["attempts", "me"] });
    },
  });
}

export function useRecordProctoringEvent(attemptId: string) {
  return useMutation({
    mutationFn: (payload: ProctoringEventPayload) => recordProctoringEvent(attemptId, payload),
  });
}

export function useProctoringEvents(attemptId: string) {
  return useQuery({
    queryKey: ["attempt", attemptId, "proctoring-events"],
    queryFn: () => getProctoringEvents(attemptId),
    enabled: !!attemptId,
  });
}