"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

const LANGUAGES = ["javascript", "python", "java", "cpp", "typescript", "go"];
const MAX_CODE_LENGTH = 20000;
const INDENT = "  ";
const LINE_HEIGHT = "1.5rem";

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
  const gutterRef = useRef<HTMLDivElement>(null);

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

  function handleScroll(e: React.UIEvent<HTMLTextAreaElement>) {
    if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
  }

  const actualLines = code.length === 0 ? 0 : code.split("\n").length;
  const gutterLines = Math.max(actualLines, 14);
  const nearLimit = code.length > MAX_CODE_LENGTH * 0.9;

  return (
    <div className="flex flex-col gap-4">
      <div className="code-editor overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Programming language"
            className="h-8 rounded-md border border-white/15 bg-transparent px-2 text-xs text-slate-200"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-400">
            {actualLines} line{actualLines === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex">
          <div
            ref={gutterRef}
            aria-hidden="true"
            className="h-80 select-none overflow-hidden border-r border-white/10 px-3 py-3 text-right font-mono text-xs text-slate-500 sm:h-96"
            style={{ lineHeight: LINE_HEIGHT }}
          >
            {Array.from({ length: gutterLines }, (_, i) => (
              <div key={`line-${i + 1}`}>{i + 1}</div>
            ))}
          </div>

          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            wrap="off"
            maxLength={MAX_CODE_LENGTH}
            spellCheck={false}
            aria-label="Your code"
            placeholder="Write your solution here..."
            className="h-80 min-w-0 flex-1 resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none sm:h-96"
            style={{ lineHeight: LINE_HEIGHT }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>Tab indents. Press Esc, then Tab, to leave the editor.</span>
        <span className={cn(nearLimit && "text-danger")}>
          {code.length}/{MAX_CODE_LENGTH}
        </span>
      </div>

      {sampleTestCases.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground">Sample test cases</p>

          {sampleTestCases.map((tc, i) => (
            <div key={tc.id} className="rounded-lg border border-border p-3 text-xs">
              <p className="mb-2 font-medium text-muted-foreground">Sample {i + 1}</p>

              <div className="grid gap-3 font-mono sm:grid-cols-2">
                <div>
                  <p className="mb-1 font-sans text-muted-foreground">Input</p>
                  <pre className="whitespace-pre-wrap rounded-md bg-muted/60 p-2">{tc.input || "—"}</pre>
                </div>

                <div>
                  <p className="mb-1 font-sans text-muted-foreground">Expected output</p>
                  <pre className="whitespace-pre-wrap rounded-md bg-muted/60 p-2">{tc.expectedOutput}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}