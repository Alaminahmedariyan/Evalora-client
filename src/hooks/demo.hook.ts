import { useMutation, useQueryClient } from "@tanstack/react-query";

import { demoLogin } from "@/api";

export function useDemoLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: demoLogin,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}