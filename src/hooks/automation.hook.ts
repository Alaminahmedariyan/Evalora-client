import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAutomationEvents, getAutomationStats, retryAutomationEvent } from "@/api";
import type { AutomationEventListParams } from "@/types";

export function useAutomationStats() {
  return useQuery({
    queryKey: ["admin", "automation", "stats"],
    queryFn: getAutomationStats,
    refetchInterval: 15_000,
  });
}

export function useAutomationEvents(params: AutomationEventListParams) {
  return useQuery({
    queryKey: ["admin", "automation", "events", params],
    queryFn: () => getAutomationEvents(params),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
  });
}

export function useRetryAutomationEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => retryAutomationEvent(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "automation"] });
    },
  });
}