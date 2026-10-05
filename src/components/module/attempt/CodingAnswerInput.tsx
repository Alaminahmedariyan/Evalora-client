"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

const LANGUAGES = ["javascript", "python", "java", "cpp", "typescript", "go"];
const MAX_CODE_LENGTH = 20000;
const INDENT = "  ";

export function CodingAnswerInput({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  sampleTestCases,
}: {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  sampleTestCases: { id: string; input: string | null; expectedOutput: string }[];
}) {
  // Pressing Escape lets a keyboard user Tab out of the editor instead of
  // being trapped in it.
  const tabLeavesEditor = useRef(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      tabLeavesEditor.current = true;
      return;
    }

    if (e.key !== "Tab") {
      tabLeavesEditor.current = false;
      return;
    }

    if (e.shiftKey || tabLeavesEditor.current) return;

    e.preventDefault();

    const editor = e.currentTarget;
    const { selectionStart, selectionEnd } = editor;

    if (code.length - (selectionEnd - selectionStart) + INDENT.length > MAX_CODE_LENGTH) return;

    onCodeChange(`${code.slice(0, selectionStart)}${INDENT}${code.slice(selectionEnd)}`);

    requestAnimationFrame(() => {
      const caret = selectionStart + INDENT.length;
      editor.selectionStart = caret;
      editor.selectionEnd = caret;
    });
  }

  const nearLimit = code.length > MAX_CODE_LENGTH * 0.9;

  return (
    <div className="flex flex-col gap-3">
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        aria-label="Programming language"
        className="h-9 w-40 rounded-md border border-input bg-background px-2 text-sm"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={16}
        maxLength={MAX_CODE_LENGTH}
        spellCheck={false}
        aria-label="Your code"
        className="code-editor w-full resize-y rounded-lg p-4 font-mono text-sm focus-visible:outline-none"
        placeholder="Write your solution here..."
      />

      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>Tab indents. Press Esc, then Tab, to leave the editor.</span>
        <span className={cn(nearLimit && "text-danger")}>
          {code.length}/{MAX_CODE_LENGTH}
        </span>
      </div>

      {sampleTestCases.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Sample test cases</p>
          {sampleTestCases.map((tc, i) => (
            <div key={tc.id} className="rounded-md border border-border p-3 text-xs">
              <p className="mb-1 text-muted-foreground">Sample {i + 1}</p>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <p className="mb-1 text-muted-foreground">Input</p>
                  <pre className="whitespace-pre-wrap">{tc.input || "—"}</pre>
                </div>
                <div>
                  <p className="mb-1 text-muted-foreground">Expected output</p>
                  <pre className="whitespace-pre-wrap">{tc.expectedOutput}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}