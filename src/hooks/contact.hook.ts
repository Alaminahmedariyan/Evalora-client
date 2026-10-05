import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteContactMessage,
  getContactMessages,
  sendContactMessage,
  updateContactMessageStatus,
} from "@/api";
import type { ContactListParams, ContactMessageStatus, ContactPayload } from "@/types";

export function useSendContactMessage() {
  return useMutation({ mutationFn: (payload: ContactPayload) => sendContactMessage(payload) });
}

export function useContactMessages(params: ContactListParams) {
  return useQuery({
    queryKey: ["admin", "contact", "messages", params],
    queryFn: () => getContactMessages(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateContact() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["admin", "contact"] });
}

export function useUpdateContactMessageStatus() {
  const invalidate = useInvalidateContact();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactMessageStatus }) =>
      updateContactMessageStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useDeleteContactMessage() {
  const invalidate = useInvalidateContact();
  return useMutation({ mutationFn: deleteContactMessage, onSuccess: invalidate });
}