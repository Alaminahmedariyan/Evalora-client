import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteMyAccount, exportMyData } from "@/api";
import { clearStoredToken } from "@/lib/apiClient";

export function useExportMyData() {
  return useMutation({ mutationFn: exportMyData });
}

export function useDeleteMyAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      clearStoredToken();
      queryClient.clear();
    },
  });
}