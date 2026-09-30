import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAllCandidates, getCandidateProfileById, getMyProfile, upsertMyProfile } from "@/api";
import type { CandidateListParams, UpsertCandidateProfilePayload } from "@/types";

export function useMyCandidateProfile() {
  return useQuery({
    queryKey: ["candidate", "me"],
    queryFn: getMyProfile,
    retry: false, // no profile yet is a normal 404, not a transient failure
  });
}

export function useUpsertCandidateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertCandidateProfilePayload) => upsertMyProfile(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["candidate", "me"] }),
  });
}

export function useCandidates(params: CandidateListParams) {
  return useQuery({ queryKey: ["candidates", params], queryFn: () => getAllCandidates(params) });
}

export function useCandidateProfile(id: string) {
  return useQuery({
    queryKey: ["candidate", id],
    queryFn: () => getCandidateProfileById(id),
    enabled: !!id,
  });
}