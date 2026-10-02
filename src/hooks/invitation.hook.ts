import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  acceptInvitation,
  cancelInvitation,
  declineInvitation,
  getInvitationsForAssessment,
  getMyInvitations,
  inviteCandidates,
} from "@/api";
import type { InvitationListParams, InviteCandidatesPayload } from "@/types";

export function useInvitationsForAssessment(assessmentId: string, params: InvitationListParams) {
  return useQuery({
    queryKey: ["invitations", "assessment", assessmentId, params],
    queryFn: () => getInvitationsForAssessment(assessmentId, params),
    enabled: !!assessmentId,
  });
}

export function useMyInvitations() {
  return useQuery({
    queryKey: ["invitations", "me"],
    queryFn: getMyInvitations,
  });
}

export function useInviteCandidates(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: InviteCandidatesPayload; idempotencyKey: string }) =>
      inviteCandidates(assessmentId, payload, idempotencyKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invitations", "assessment", assessmentId] });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptInvitation,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["invitations", "me"] }),
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: declineInvitation,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["invitations", "me"] }),
  });
}

export function useCancelInvitation(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelInvitation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invitations", "assessment", assessmentId] });
    },
  });
}