import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelMySubscription,
  getMyCompany,
  getMySubscription,
  registerCompany,
  updateMyCompany,
  updateMySubscription,
} from "@/api";
import { isApiError } from "@/lib/apiClient";

export function useMyCompany() {
  return useQuery({
    queryKey: ["company", "me"],
    queryFn: getMyCompany,
    retry: false,
    // A RECRUITER without a company (shouldn't normally happen) or a
    // CANDIDATE checking "do I have a company yet" both get a 404 here —
    // that's an expected, non-error state for this query, not a real
    // fetch failure. Callers should branch on `isError` + the 404 status
    // rather than treating it as a loading/retry situation.
  });
}

export function useRegisterCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerCompany,
    onSuccess: () => {
      // Registering a company promotes the caller to RECRUITER server-side,
      // but that new role isn't in this response — refetch the session so
      // middleware/RoleGuard see the updated role on the very next nav.
      void queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["company", "me"] });
    },
  });
}

export function useUpdateMyCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyCompany,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["company", "me"] });
    },
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: ["company", "subscription"],
    queryFn: getMySubscription,
    retry: false,
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMySubscription,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["company", "subscription"] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelMySubscription,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["company", "subscription"] });
    },
  });
}

export { isApiError };