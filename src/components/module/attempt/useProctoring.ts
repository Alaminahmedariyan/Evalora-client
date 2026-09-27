"use client";

import { useEffect, useRef } from "react";

import { useRecordProctoringEvent } from "@/hooks";
import type { ProctoringEventType } from "@/types";

/**
 * Wires up the browser-level signals a proctored exam needs to catch, and
 * forwards each one to the backend as it happens. Deliberately best-effort
 * — a proctoring beacon failing to send should never block the candidate
 * from continuing their attempt (see the backend's own "stale beacon is
 * not an error" comment in attempt.service.ts).
 */
export function useProctoring(attemptId: string, isActive: boolean, onTabSwitch?: () => void) {
  const recordMutation = useRecordProctoringEvent(attemptId);
  const record = useRef(recordMutation.mutate);
  record.current = recordMutation.mutate;

  useEffect(() => {
    if (!isActive) return;

    function send(eventType: ProctoringEventType, metadata?: Record<string, unknown>) {
      record.current({ eventType, metadata });
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        send("TAB_SWITCH");
        onTabSwitch?.();
      }
    }

    function onFullscreenChange() {
      if (!document.fullscreenElement) send("FULLSCREEN_EXIT");
    }

    function onBlur() {
      send("WINDOW_BLUR");
    }

    function onFocus() {
      send("WINDOW_FOCUS");
    }

    function onCopy() {
      send("COPY");
    }

    function onPaste() {
      send("PASTE");
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
    };
  }, [isActive, onTabSwitch]);
}