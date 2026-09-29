import {
  Bell,
  CreditCard,
  FileCheck,
  Mail,
  type LucideIcon,
  XCircle,
} from "lucide-react";

import type { NotificationType } from "@/types";

export const NOTIFICATION_ICON: Record<NotificationType, LucideIcon> = {
  ASSESSMENT_INVITATION: Mail,
  ASSESSMENT_REMINDER: Bell,
  ASSESSMENT_RESULT: FileCheck,
  ATTEMPT_SUBMITTED: FileCheck,
  ATTEMPT_EVALUATED: FileCheck,
  PAYMENT_SUCCESS: CreditCard,
  PAYMENT_FAILED: XCircle,
  SYSTEM: Bell,
};

export const NOTIFICATION_ACCENT: Record<NotificationType, string> = {
  ASSESSMENT_INVITATION: "text-primary",
  ASSESSMENT_REMINDER: "text-warning",
  ASSESSMENT_RESULT: "text-success",
  ATTEMPT_SUBMITTED: "text-primary",
  ATTEMPT_EVALUATED: "text-success",
  PAYMENT_SUCCESS: "text-success",
  PAYMENT_FAILED: "text-danger",
  SYSTEM: "text-muted-foreground",
};