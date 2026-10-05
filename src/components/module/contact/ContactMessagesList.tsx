"use client";

import { useState } from "react";
import { ChevronDown, Inbox, Mail, Trash2 } from "lucide-react";

import type { ContactMessage, ContactMessageStatus } from "@/types";
import {
  useContactMessages,
  useDebounce,
  useDeleteContactMessage,
  useUpdateContactMessageStatus,
} from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePagination } from "@/components/ui/table-pagination";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

type CardProps = {
  message: ContactMessage;
  busy: boolean;
  onOpen: (message: ContactMessage) => void;
  onStatus: (message: ContactMessage, status: ContactMessageStatus) => void;
  onDelete: (message: ContactMessage) => void;
};

function MessageCard({ message, busy, onOpen, onStatus, onDelete }: CardProps) {
  const [open, setOpen] = useState(false);
  const isNew = message.status === "NEW";

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) onOpen(message);
  }

  return (
    <li className="card-evalora p-4">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="interactive flex w-full items-start gap-3 text-left"
      >
        <span
          className={cn("mt-1.5 size-2 shrink-0 rounded-full", isNew ? "bg-primary" : "bg-transparent")}
          aria-label={isNew ? "Unread" : undefined}
        />
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-sm", isNew ? "font-semibold" : "font-medium")}>
            {message.subject}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {message.name} · {message.email} · {formatWhen(message.createdAt)}
          </p>
        </div>
        <ChevronDown
          className={cn("mt-1 size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.message}</p>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm">
              <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}>
                <Mail className="size-3.5" aria-hidden="true" />
                Reply by email
              </a>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onStatus(message, isNew ? "READ" : "NEW")}
            >
              {isNew ? "Mark as read" : "Mark as unread"}
            </Button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDelete(message)}
              className="interactive ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
              aria-label={`Delete message from ${message.name}`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

export function ContactMessagesList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContactMessageStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const { data, isPending, isError } = useContactMessages({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: status === "ALL" ? undefined : status,
  });

  const statusMutation = useUpdateContactMessageStatus();
  const deleteMutation = useDeleteContactMessage();

  function handleOpen(message: ContactMessage) {
    if (message.status === "NEW") statusMutation.mutate({ id: message.id, status: "READ" });
  }

  async function handleStatus(message: ContactMessage, next: ContactMessageStatus) {
    setBusyId(message.id);
    try {
      await statusMutation.mutateAsync({ id: message.id, status: next });
    } catch (error) {
      notify.error("Couldn't update the message", isApiError(error) ? error.message : undefined);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(message: ContactMessage) {
    if (!window.confirm(`Delete the message from ${message.name}? This can't be undone.`)) return;

    setBusyId(message.id);
    try {
      await deleteMutation.mutateAsync(message.id);
      notify.success("Message deleted");
    } catch (error) {
      notify.error("Couldn't delete the message", isApiError(error) ? error.message : undefined);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, email or subject..."
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ContactMessageStatus | "ALL");
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter by status"
        >
          <option value="ALL">All messages</option>
          <option value="NEW">Unread</option>
          <option value="READ">Read</option>
        </select>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load messages. Try refreshing the page.
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          icon={Inbox}
          title="No messages"
          description="Messages sent from the contact page will appear here."
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {data.data.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                busy={busyId === message.id}
                onOpen={handleOpen}
                onStatus={handleStatus}
                onDelete={handleDelete}
              />
            ))}
          </ul>

          <TablePagination
            page={data.meta?.page ?? page}
            totalPages={data.meta?.totalPage ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}