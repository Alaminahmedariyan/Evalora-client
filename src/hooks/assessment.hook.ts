import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  closeAssessment,
  createAssessment,
  createAssessmentVersion,
  deleteAssessment,
  getAllAssessments,
  getAssessmentById,
  getAssessmentVersions,
  publishAssessment,
  restoreAssessmentVersion,
  updateAssessment,
} from "@/api";
import type { AssessmentListParams, UpdateAssessmentPayload } from "@/types";

export function useAssessments(params: AssessmentListParams) {
  return useQuery({
    queryKey: ["assessments", params],
    queryFn: () => getAllAssessments(params),
  });
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: ["assessment", id],
    queryFn: () => getAssessmentById(id),
    enabled: !!id,
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAssessment,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["assessments"] }),
  });
}

export function useUpdateAssessment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAssessmentPayload) => updateAssessment(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assessment", id] });
      void queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

function useAssessmentAction(mutationFn: (id: string) => ReturnType<typeof publishAssessment>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_res, id) => {
      void queryClient.invalidateQueries({ queryKey: ["assessment", id] });
      void queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

export function usePublishAssessment() {
  return useAssessmentAction(publishAssessment);
}

export function useCloseAssessment() {
  return useAssessmentAction(closeAssessment);
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAssessment,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["assessments"] }),
  });
}

export function useAssessmentVersions(id: string) {
  return useQuery({
    queryKey: ["assessment", id, "versions"],
    queryFn: () => getAssessmentVersions(id),
    enabled: !!id,
  });
}

export function useCreateAssessmentVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAssessmentVersion,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["assessments"] }),
  });
}

export function useRestoreAssessmentVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreAssessmentVersion,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["assessments"] }),
  });
}