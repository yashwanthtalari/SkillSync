import React from "react";
import { Sparkles } from "lucide-react";

interface MatchBadgeProps {
  score?: number;
  size?: "sm" | "md" | "lg";
}

export function MatchBadge({ score, size = "md" }: MatchBadgeProps) {
  if (score === undefined || score === null) return null;

  let bgClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200";
  if (score >= 90) {
    bgClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
  } else if (score >= 75) {
    bgClass = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
  } else if (score >= 60) {
    bgClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm font-semibold",
    lg: "px-3.5 py-1.5 text-base font-bold"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-transform hover:scale-105 ${bgClass} ${sizeClasses[size]}`}>
      <Sparkles className={size === "lg" ? "w-4 h-4 text-emerald-500 animate-pulse" : "w-3.5 h-3.5"} />
      <span>{Math.round(score)}% Match</span>
    </span>
  );
}
