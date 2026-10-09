"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight, Trash2 } from "lucide-react";

import type { Notification } from "@/types";
import { cn } from "@/lib/utils";
import { NOTIFICATION_ACCENT, NOTIFICATION_ICON } from "./notification-icons";
import { getNotificationHref, timeAgo } from "./notification-utils";

export function NotificationItem({
  notification,
  onRead,
  onDelete,
  onNavigate,
  expanded = false,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: () => void;
  expanded?: boolean;
}) {
  const router = useRouter();
  const Icon = NOTIFICATION_ICON[notification.type];
  const href = getNotificationHref(notification);

  function handleOpen() {
    if (!notification.isRead) onRead(notification.id);

    if (href) {
      onNavigate?.();
      router.push(href);
    }
  }

  return (
    <div
      className={cn(
        "interactive flex items-start gap-3 px-4 py-3 text-sm hover:bg-accent/40",
        !notification.isRead && "bg-primary/5",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted",
          NOTIFICATION_ACCENT[notification.type],
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>

      <button
        type="button"
        onClick={handleOpen}
        className="min-w-0 flex-1 text-left"
      >
        <p
          className={cn(
            "flex items-center gap-2",
            !expanded && "truncate",
            !notification.isRead && "font-semibold",
          )}
        >
          <span className={cn(!expanded && "truncate")}>
            {notification.title}
          </span>

          {!notification.isRead && (
            <span
              className="size-1.5 shrink-0 rounded-full bg-primary"
              aria-hidden="true"
            />
          )}
        </p>

        <p
          className={cn(
            "mt-0.5 text-xs text-muted-foreground",
            !expanded && "line-clamp-2",
          )}
        >
          {notification.message}
        </p>

        <p className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>{timeAgo(notification.createdAt)}</span>

          {href && (
            <span className="inline-flex items-center gap-0.5 text-primary">
              View
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </span>
          )}
        </p>
      </button>

      <button
        type="button"
        onClick={() => onDelete(notification.id)}
        className="interactive shrink-0 rounded-md p-1 text-muted-foreground hover:bg-danger/10 hover:text-danger"
        aria-label="Delete notification"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}