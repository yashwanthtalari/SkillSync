import React from "react";

interface SkillBadgeProps {
  name: string;
  level?: string;
}

export function SkillBadge({ name, level }: SkillBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
      {name}
      {level && <span className="text-[10px] text-slate-400 capitalize">({level})</span>}
    </span>
  );
}
