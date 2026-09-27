"use client";

const LANGUAGES = ["javascript", "python", "java", "cpp", "typescript", "go"];

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
  return (
    <div className="flex flex-col gap-3">
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
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
        rows={16}
        spellCheck={false}
        className="code-editor w-full resize-y rounded-lg p-4 font-mono text-sm focus-visible:outline-none"
        placeholder="Write your solution here..."
      />

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