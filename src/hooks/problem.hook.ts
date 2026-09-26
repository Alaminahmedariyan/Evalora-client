import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createProblem, deleteProblem, getAllProblems, getProblemById, updateProblem } from "@/api";
import type { ProblemListParams, UpdateProblemPayload } from "@/types";

export function useProblems(params: ProblemListParams) {
  return useQuery({
    queryKey: ["problems", params],
    queryFn: () => getAllProblems(params),
  });
}

export function useProblem(id: string) {
  return useQuery({
    queryKey: ["problem", id],
    queryFn: () => getProblemById(id),
    enabled: !!id,
  });
}

export function useCreateProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProblem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
    },
  });
}

export function useDeleteProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProblem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
    },
  });
}

export function useUpdateProblem(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProblemPayload) => updateProblem(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["problem", id] });
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
    },
  });
}