import { Loader2 } from "lucide-react";

export function LoadingOverlay({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ background: "var(--glass-background)" }}
    >
      <div className="surface-elevated flex flex-col items-center gap-3 rounded-xl px-8 py-6">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">{label}</p>
      </div>
    </div>
  );
}