"use client";

import { cn } from "@/lib/utils";

const MAX_LENGTH = 20000;

export function WrittenAnswerInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        maxLength={MAX_LENGTH}
        aria-label="Your answer"
        className="interactive w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Write your answer here..."
      />
      <p className={cn("self-end text-xs text-muted-foreground", value.length > MAX_LENGTH * 0.9 && "text-danger")}>
        {value.length}/{MAX_LENGTH}
      </p>
    </div>
  );
}