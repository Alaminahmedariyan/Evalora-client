import type { Notification } from "@/types";

export function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Where a notification should take the reader when clicked, or null when it
 * has nowhere to go.
 */
export function getNotificationHref(notification: Notification): string | null {
  const metadata = notification.metadata;
  const attemptId = metadata?.attemptId;
  const companyId = metadata?.companyId;
  const kind = metadata?.kind;

  if (
    typeof attemptId === "string" &&
    (notification.type === "ASSESSMENT_RESULT" || notification.type === "ATTEMPT_EVALUATED")
  ) {
    return `/candidate/results/${attemptId}`;
  }

  if (notification.type === "ASSESSMENT_INVITATION" || notification.type === "ASSESSMENT_REMINDER") {
    return "/candidate/invitations";
  }

  if (notification.type === "SYSTEM" && typeof companyId === "string") {
    if (kind === "company_verified") return "/recruiter/company";
    if (kind === "company_pending") return `/admin/companies/${companyId}`;

    // Notifications created before "kind" existed are told apart by title.
    if (notification.title === "Your company is verified") return "/recruiter/company";
    if (notification.title === "New company awaiting verification") return `/admin/companies/${companyId}`;
  }

  return null;
}