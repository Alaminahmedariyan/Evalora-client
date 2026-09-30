import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

import {
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useMyNotifications,
  useUnreadCount,
} from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { NotificationItem } from "./NotificationItem";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: unread } = useUnreadCount();
  const { data, isPending } = useMyNotifications({ page: 1, limit: 10 });
  const markReadMutation = useMarkAsRead();
  const markAllMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();

  const unreadCount = unread?.data.unreadCount ?? 0;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleMarkAllRead() {
    try {
      await markAllMutation.mutateAsync();
    } catch (error) {
      notify.error("Couldn't mark all as read", isApiError(error) ? error.message : undefined);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      notify.error("Couldn't delete notification", isApiError(error) ? error.message : undefined);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="interactive relative rounded-md p-2 hover:bg-accent"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
      >
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-danger-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      <div
        role="menu"
        className={cn(
          "surface-elevated absolute right-0 top-12 flex w-80 flex-col rounded-lg transition",
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markAllMutation.isPending}
              className="interactive flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-60"
            >
              <CheckCheck className="size-3.5" aria-hidden="true" />
              Mark all read
            </button>
          ) : null}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isPending ? (
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {data.data.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={(id) => markReadMutation.mutate(id)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}