import React from "react";
import Link from "next/link";
import { Task } from "@/lib/types";
import { MatchBadge } from "./MatchBadge";
import { SkillBadge } from "./SkillBadge";
import { Clock, IndianRupee, MapPin, Building2, ChevronRight, Calendar } from "lucide-react";

interface TaskCardProps {
  task: Task;
  matchScore?: number;
}

export function TaskCard({ task, matchScore }: TaskCardProps) {
  const isUrgent = new Date(task.deadline).getTime() - new Date().getTime() < 86400000 * 2;

  return (
    <div className="group relative bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {task.category}
          </span>
          <div className="flex items-center gap-2">
            {matchScore !== undefined && <MatchBadge score={matchScore} size="sm" />}
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {task.work_mode.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Title & Client */}
        <Link href={`/student/tasks/${task.id}`}>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
            {task.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
          <Building2 className="w-3.5 h-3.5" />
          <span>{task.organization_name || task.client_name || "Client"}</span>
        </div>

        {/* Description Excerpt */}
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {task.description}
        </p>

        {/* Required Skills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {task.required_skills?.map((s) => (
            <SkillBadge key={s.id} name={s.skill_name} level={s.required_level} />
          ))}
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center font-bold text-slate-900 dark:text-white text-base">
            <span>₹{task.budget_min.toLocaleString()}</span>
            {task.budget_max > task.budget_min && (
              <span> – ₹{task.budget_max.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              {task.estimated_hours} hrs
            </span>
            <span className={`flex items-center gap-1 ${isUrgent ? "text-amber-600 dark:text-amber-400 font-medium" : ""}`}>
              <Calendar className="w-3.5 h-3.5" />
              {new Date(task.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        <Link
          href={`/student/tasks/${task.id}`}
          className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs shadow-indigo-500/20 group-hover:translate-x-0.5 transition-all"
        >
          View Task
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
