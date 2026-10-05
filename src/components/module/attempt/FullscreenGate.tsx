"use client";

import { useEffect, useState } from "react";
import { Maximize } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Asks the candidate to take the assessment in full screen, and asks again
 * if they leave it. Browsers only allow full screen after a click, so this
 * is a prompt rather than something that can be forced. It is skipped where
 * the browser has no full-screen support (for example iPhone Safari), and a
 * candidate whose browser refuses can continue. Leaving full screen is
 * recorded by useProctoring either way.
 */
export function FullscreenGate({ active }: { active: boolean }) {
  const [supported, setSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setSupported(Boolean(document.fullscreenEnabled));
    setIsFullscreen(Boolean(document.fullscreenElement));

    function onChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setFailed(false);
    }

    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  if (!active || !supported || isFullscreen || dismissed) return null;

  async function enter() {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      setFailed(true);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fullscreen-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-6"
    >
      <div className="card-evalora flex max-w-md flex-col items-start gap-4 p-8">
        <Maximize className="size-8 text-primary" aria-hidden="true" />

        <div>
          <h2 id="fullscreen-title" className="text-lg font-semibold">
            Take this assessment in full screen
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Leaving full screen is recorded for the reviewer. Your timer keeps running while you decide,
            and your answers are saved as you type.
          </p>
        </div>

        {failed ? (
          <p role="alert" className="text-xs text-danger">
            Your browser didn&apos;t allow full screen. You can continue without it.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void enter()}>Enter full screen</Button>
          {failed ? (
            <Button variant="outline" onClick={() => setDismissed(true)}>
              Continue without full screen
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}