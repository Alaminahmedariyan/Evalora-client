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
  return useMutation({
    mutationFn: ({ assessmentId, idempotencyKey }: { assessmentId: string; idempotencyKey: string }) =>
      startAttempt(assessmentId, idempotencyKey),
  });
}

export function useSaveSubmission(attemptId: string) {
  return useMutation({
    mutationFn: ({
      problemId,
      payload,
      idempotencyKey,
    }: {
      problemId: string;
      payload: SaveSubmissionPayload;
      idempotencyKey: string;
    }) => saveSubmission(attemptId, problemId, payload, idempotencyKey),
  });
}

export function useSubmitAttempt(attemptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idempotencyKey: string) => submitAttempt(attemptId, idempotencyKey),
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