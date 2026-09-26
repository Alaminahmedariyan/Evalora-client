import type { Difficulty } from "@/types";

const CLASS_MAP: Record<Difficulty, string> = {
  EASY: "difficulty-easy",
  MEDIUM: "difficulty-medium",
  HARD: "difficulty-hard",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${CLASS_MAP[difficulty]}`}>
      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
    </span>
  );
}