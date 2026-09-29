export type NotificationType =
  | "ASSESSMENT_INVITATION"
  | "ASSESSMENT_REMINDER"
  | "ASSESSMENT_RESULT"
  | "ATTEMPT_SUBMITTED"
  | "ATTEMPT_EVALUATED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "SYSTEM";

// Matches NOTIFICATION_SELECT exactly.
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}