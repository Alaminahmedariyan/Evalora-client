"use client";

import { Trash2 } from "lucide-react";

import type { Notification } from "@/types";
import { NOTIFICATION_ACCENT, NOTIFICATION_ICON } from "./notification-icons";
import { cn } from "@/lib/utils";

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = NOTIFICATION_ICON[notification.type];

  return (
    <div
      className={cn(
        "interactive flex items-start gap-3 px-4 py-3 text-sm",
        !notification.isRead && "bg-primary/5",
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", NOTIFICATION_ACCENT[notification.type])} aria-hidden="true" />
      <button type="button" onClick={() => !notification.isRead && onRead(notification.id)} className="min-w-0 flex-1 text-left">
        <p className={cn("truncate", !notification.isRead && "font-semibold")}>{notification.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(notification.createdAt)}</p>
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