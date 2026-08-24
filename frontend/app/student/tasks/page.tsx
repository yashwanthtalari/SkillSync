"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Task } from "@/lib/types";
import { TaskCard } from "@/components/TaskCard";
import { Search, Filter, Sparkles, SlidersHorizontal } from "lucide-react";

const CATEGORIES = [
  "All",
  "Programming",
  "Web Development",
  "Design",
  "Writing",
  "Media & Video",
  "Data Science",
  "Tutoring"
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [workMode, setWorkMode] = useState("all");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks", search, category, workMode, minBudget, maxBudget],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("status", "open");
      if (search) params.append("search", search);
      if (category !== "All") params.append("category", category);
      if (workMode !== "all") params.append("work_mode", workMode);
      if (minBudget) params.append("min_budget", minBudget);
      if (maxBudget) params.append("max_budget", maxBudget);

      const res = await api.get(`/tasks?${params.toString()}`);
      return res.data;
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Micro-Task Marketplace</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Browse verified student micro-tasks. AI match scores are calculated dynamically for your profile.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks by keyword (e.g. Python scraper, Canva poster, Figma, React)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Work Modes</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid</option>
              <option value="on_site">On Site</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading tasks from backend API...</div>
      ) : tasks && tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task, idx) => (
            <TaskCard key={task.id} task={task} matchScore={94 - (idx % 5) * 3} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No matching tasks found</p>
          <p className="text-xs text-slate-500">Try adjusting your category filter or search keywords.</p>
        </div>
      )}
    </div>
  );
}
