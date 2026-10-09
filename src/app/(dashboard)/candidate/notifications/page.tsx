"use client";

import { useState } from "react";
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
import { NotificationItem } from "@/components/module/notification";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Filter = "all" | "unread";

const PAGE_SIZE = 10;

export default function CandidateNotificationsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  const { data, isPending, isError } = useMyNotifications({
    page,
    limit: PAGE_SIZE,
    isRead: filter === "unread" ? false : undefined,
  });
  const { data: unread } = useUnreadCount();

  const markReadMutation = useMarkAsRead();
  const markAllMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();

  const unreadCount = unread?.data.unreadCount ?? 0;
  const notifications = data?.data ?? [];

  async function handleMarkAll() {
    try {
      await markAllMutation.mutateAsync();
    } catch (error) {
      notify.error(
        "Couldn't mark all as read",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      notify.error(
        "Couldn't delete notification",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
              : "You're all caught up."}
          </p>
        </div>

        {unreadCount > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            isLoading={markAllMutation.isPending}
          >
            <CheckCheck className="size-3.5" aria-hidden="true" />
            Mark all read
          </Button>
        ) : null}
      </div>

      <Tabs
        value={filter}
        onValueChange={(value) => {
          setFilter(value as Filter);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {["notif-skeleton-1", "notif-skeleton-2", "notif-skeleton-3", "notif-skeleton-4"].map(
            (id) => (
              <Skeleton key={id} className="h-16 w-full rounded-xl" />
            ),
          )}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load your notifications.
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
          description={
            filter === "unread"
              ? "Everything has been read."
              : "Invitations and results will show up here."
          }
        />
      ) : (
        <>
          <div className="card-evalora flex flex-col divide-y divide-border overflow-hidden">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                expanded
                onRead={(id) => markReadMutation.mutate(id)}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {data?.meta && data.meta.totalPage > 1 ? (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {data.meta.page} of {data.meta.totalPage}
              </span>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.meta.totalPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}