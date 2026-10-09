"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function AttemptTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [remainingMs, setRemainingMs] = useState(() => new Date(expiresAt).getTime() - Date.now());

  const onExpireRef = useRef(onExpire);
  const firedRef = useRef(false);
  const warnedFiveRef = useRef(false);
  const warnedOneRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    const expiry = new Date(expiresAt).getTime();

    function tick() {
      const next = expiry - Date.now();
      setRemainingMs(next);

      if (next <= 5 * 60_000 && next > 60_000 && !warnedFiveRef.current) {
        warnedFiveRef.current = true;
        notify.info("Less than 5 minutes left", "Your attempt is submitted automatically when time runs out.");
      }

      if (next <= 60_000 && next > 0 && !warnedOneRef.current) {
        warnedOneRef.current = true;
        notify.info("Less than 1 minute left", "Finish up now.");
      }

      if (next <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpireRef.current();
      }
    }

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const critical = remainingMs <= 60_000;
  const warning = remainingMs <= 5 * 60_000;

  return (
    <span
      role="timer"
      aria-label="Time remaining"
      className={cn(
        "stat-number inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-sm font-semibold",
        critical
          ? "timer-critical border-danger/40 bg-danger/10"
          : warning
            ? "timer-warning border-warning/40 bg-warning/10"
            : "timer-normal border-border bg-card",
      )}
    >
      <Clock className="size-3.5" aria-hidden="true" />
      {formatDuration(remainingMs)}
    </span>
  );
}