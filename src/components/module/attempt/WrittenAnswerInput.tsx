"use client";

import { cn } from "@/lib/utils";

const MAX_LENGTH = 20000;

export function WrittenAnswerInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const trimmed = value.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        maxLength={MAX_LENGTH}
        aria-label="Your answer"
        className="interactive min-h-60 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Write your answer here..."
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {words} word{words === 1 ? "" : "s"}
        </span>
        <span className={cn(value.length > MAX_LENGTH * 0.9 && "text-danger")}>
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}