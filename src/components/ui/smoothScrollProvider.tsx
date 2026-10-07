"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";

// Routes where smooth scrolling must stay off, for example a live exam screen with its own scroll areas.
const DISABLED_PREFIXES: string[] = [];

// Anything matching these selectors keeps its own native scrolling (modals, menus, code editors).
const NATIVE_SCROLL_SELECTOR = [
  "[data-lenis-prevent]",
  ".exam-trust-zone",
  ".code-editor",
  "[role='dialog']",
  "[role='listbox']",
  "[role='menu']",
  "[data-slot='dialog-overlay']",
  "[data-slot='scroll-area-viewport']",
  "[data-radix-scroll-area-viewport]",
].join(",");

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const disabled = DISABLED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (disabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      prevent: (node: Element) => node.closest(NATIVE_SCROLL_SELECTOR) !== null,
    });

    lenis.on("scroll", ({ progress }: { progress: number }) => {
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
    });

    let frame = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [disabled]);

  return (
    <>
      {disabled ? null : <div ref={barRef} aria-hidden="true" className="scroll-progress" />}
      {children}
    </>
  );
}