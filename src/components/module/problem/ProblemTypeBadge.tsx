import { CheckSquare, Code2, FileText } from "lucide-react";

import type { ProblemType } from "@/types";

// Type isn't a status (design-system.md reserves .status-* for state
// semantics) and isn't a difficulty either — so this gets its own
// neutral, non-color-coded chip. The icon carries the meaning, not color.
const TYPE_CONFIG: Record<ProblemType, { label: string; icon: typeof CheckSquare }> = {
  MCQ: { label: "MCQ", icon: CheckSquare },
  CODING: { label: "Coding", icon: Code2 },
  WRITTEN: { label: "Written", icon: FileText },
};

export function ProblemTypeBadge({ type }: { type: ProblemType }) {
  const { label, icon: Icon } = TYPE_CONFIG[type];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}