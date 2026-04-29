"use client";

import { useViewMode } from "@/components/ViewModeProvider";
import type { ViewMode } from "@/components/ViewModeProvider";

type ViewModeToggleProps = {
  className?: string;
  labels?: {
    beginner: string;
    soc: string;
  };
};

export function ViewModeToggle({
  className = "",
  labels = {
    beginner: "Beginner",
    soc: "SOC"
  }
}: ViewModeToggleProps) {
  const { viewMode, setViewMode } = useViewMode();
  const options: Array<{ label: string; mode: ViewMode }> = [
    { label: labels.beginner, mode: "beginner" },
    { label: labels.soc, mode: "soc" }
  ];

  return (
    <div className={`glass-panel inline-flex items-center rounded-full p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.mode}
          type="button"
          onClick={() => setViewMode(option.mode)}
          className={`focus-ring technical h-8 rounded-full px-3 text-[10px] uppercase tracking-[0.16em] transition ${
            viewMode === option.mode ? "bg-lime text-obsidian shadow-lime" : "text-zinc-400 hover:text-ink"
          }`}
          aria-pressed={viewMode === option.mode}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
