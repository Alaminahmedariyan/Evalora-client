import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  changePassword,
  getMe,
  resetPasswordWithOtp,
  sendEmailOtp,
  userLogin,
  userLogout,
  userRegister,
  verifyEmailOtp,
} from "@/api";

export function useRegister() {
  return useMutation({ mutationFn: userRegister });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userLogin,
    onSuccess: (res) => {
      // A twoFactorRedirect response hasn't actually established a
      // session yet — don't warm the "me" cache until real verification
      // completes (see the two-factor flow, which uses authClient directly).
      if (!res.data?.twoFactorRedirect) {
        void queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      }
    },
  });
}

export function useSendEmailOtp() {
  return useMutation({ mutationFn: sendEmailOtp });
}

export function useVerifyEmailOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyEmailOtp,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}

export function useResetPasswordWithOtp() {
  return useMutation({ mutationFn: resetPasswordWithOtp });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userLogout,
    onSuccess: () => {
      queryClient.setQueryData(["user", "me"], undefined);
      void queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}

export function useGetMe() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: getMe,
    retry: false,
  });
}