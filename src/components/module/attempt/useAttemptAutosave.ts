"use client";

import { useCallback, useEffect, useState } from "react";

import type { SaveSubmissionPayload } from "@/types";
import { useSaveSubmission } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";

const DEBOUNCE_MS = 1500;
const RETRY_MS = 5000;

export type SaveStatus = "saved" | "saving" | "error";

type FailureKind = "ended" | "fatal" | "retry";

function classify(error: unknown): FailureKind {
  if (isApiError(error)) {
    // 409 / 410: the attempt is no longer IN_PROGRESS (submitted or timed out).
    if (error.statusCode === 409 || error.statusCode === 410) return "ended";
    // Worth trying again: rate limited, or the server had a problem.
    if (error.statusCode === 429 || error.statusCode >= 500) return "retry";
    // 400 / 404: sending the same thing again can never succeed.
    return "fatal";
  }

  // No response at all: a network problem.
  return "retry";
}

type Deps = {
  save: (problemId: string, payload: SaveSubmissionPayload) => Promise<unknown>;
  onEnded: () => void;
  onStatus: (status: SaveStatus) => void;
};

/**
 * Debounced, ordered, retrying autosave. Only the newest answer per problem
 * is ever sent, at most one request per problem is in flight, and an answer
 * that fails for a temporary reason is kept and sent again.
 */
class AutosaveController {
  private deps: Deps;
  private pending = new Map<string, SaveSubmissionPayload>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private active = new Map<string, Promise<boolean>>();
  private failed = new Set<string>();
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private warned = false;
  private ended = false;

  constructor(deps: Deps) {
    this.deps = deps;
  }

  setDeps(deps: Deps) {
    this.deps = deps;
  }

  queue(problemId: string, payload: SaveSubmissionPayload) {
    if (this.ended) return;

    this.pending.set(problemId, payload);

    const existing = this.timers.get(problemId);
    if (existing) clearTimeout(existing);

    this.timers.set(
      problemId,
      setTimeout(() => {
        this.timers.delete(problemId);
        void this.start(problemId);
      }, DEBOUNCE_MS),
    );

    this.report();
  }

  /** Sends everything now. Resolves true only when nothing is left unsaved. */
  async flush(): Promise<boolean> {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();

    for (let round = 0; round < 5; round += 1) {
      const ids = new Set([...this.pending.keys(), ...this.active.keys()]);

      if (ids.size === 0) return !this.ended && this.failed.size === 0;

      const results = await Promise.all([...ids].map((id) => this.start(id)));

      if (results.some((ok) => !ok)) return false;
    }

    return false;
  }

  dispose() {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();

    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
  }

  private start(problemId: string): Promise<boolean> {
    const running = this.active.get(problemId);
    if (running) return running;

    const promise = this.run(problemId).then((ok) => {
      this.active.delete(problemId);

      // A newer answer may have been queued while the last request finished.
      if (ok && this.pending.has(problemId)) void this.start(problemId);

      this.report();
      return ok;
    });

    this.active.set(problemId, promise);
    this.report();

    return promise;
  }

  private async run(problemId: string): Promise<boolean> {
    for (;;) {
      const payload = this.pending.get(problemId);

      if (!payload || this.ended) return true;

      this.pending.delete(problemId);

      try {
        await this.deps.save(problemId, payload);
        this.failed.delete(problemId);
        this.warned = false;
      } catch (error) {
        return this.handleFailure(problemId, payload, error);
      }
    }
  }

  private handleFailure(problemId: string, payload: SaveSubmissionPayload, error: unknown): boolean {
    const kind = classify(error);

    if (kind === "ended") {
      this.ended = true;
      this.pending.clear();
      this.deps.onEnded();
      return false;
    }

    this.failed.add(problemId);

    if (kind === "retry") {
      // Keep the answer so it is sent again, unless a newer version is waiting.
      if (!this.pending.has(problemId)) this.pending.set(problemId, payload);

      if (!this.warned) {
        this.warned = true;
        notify.error("Couldn't save your answer", "Check your connection. We'll keep trying.");
      }

      this.scheduleRetry();
    } else {
      notify.error("Couldn't save your answer", isApiError(error) ? error.message : undefined);
    }

    return false;
  }

  private scheduleRetry() {
    if (this.retryTimer || this.ended) return;

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.flush();
    }, RETRY_MS);
  }

  private report() {
    if (this.failed.size > 0) this.deps.onStatus("error");
    else if (this.pending.size > 0 || this.active.size > 0 || this.timers.size > 0) {
      this.deps.onStatus("saving");
    } else this.deps.onStatus("saved");
  }
}

export function useAttemptAutosave(attemptId: string, onAttemptEnded: () => void) {
  const { mutateAsync } = useSaveSubmission(attemptId);
  const [status, setStatus] = useState<SaveStatus>("saved");

  const [controller] = useState(
    () =>
      new AutosaveController({
        save: (problemId, payload) => mutateAsync({ problemId, payload }),
        onEnded: onAttemptEnded,
        onStatus: setStatus,
      }),
  );

  useEffect(() => {
    controller.setDeps({
      save: (problemId, payload) => mutateAsync({ problemId, payload }),
      onEnded: onAttemptEnded,
      onStatus: setStatus,
    });
  });

  useEffect(() => () => controller.dispose(), [controller]);

  const queueSave = useCallback(
    (problemId: string, payload: SaveSubmissionPayload) => controller.queue(problemId, payload),
    [controller],
  );

  const flush = useCallback(() => controller.flush(), [controller]);

  return { queueSave, flush, status };
}