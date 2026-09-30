"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SkillsInput({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function addSkill() {
    const trimmed = draft.trim();
    if (!trimmed || value.includes(trimmed) || value.length >= 30) return;
    onChange([...value, trimmed]);
    setDraft("");
  }

  function removeSkill(skill: string) {
    onChange(value.filter((s) => s !== skill));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="skills-input">Skills</Label>
      <Input
        id="skills-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addSkill();
          }
        }}
        onBlur={addSkill}
        placeholder="Type a skill and press Enter"
      />
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                aria-label={`Remove ${skill}`}
                className="interactive rounded-full hover:text-danger"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
