"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Task, ClientProfile } from "@/lib/types";
import { Sparkles, PlusCircle, Briefcase, Users, CheckCircle2, Clock, IndianRupee, ArrowRight } from "lucide-react";

export default function ClientDashboard() {
  const { user } = useAuth();
  const clientId = user?.profile_id;

  // Fetch Client Profile
  const { data: profile } = useQuery<ClientProfile>({
    queryKey: ["client_profile", clientId],
    queryFn: async () => {
      const res = await api.get(`/clients/${clientId}`);
      return res.data;
    },
    enabled: !!clientId
  });

  // Fetch Client Tasks
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["client_tasks", clientId],
    queryFn: async () => {
      const res = await api.get(`/tasks?client_id=${clientId}`);
      return res.data;
    },
    enabled: !!clientId
  });

  const openTasksCount = tasks?.filter(t => t.status === "open").length || 0;
  const totalApplications = tasks?.reduce((acc, t) => acc + (t.applications_count || 0), 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {profile?.organization_name || "Client Organization"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Client Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Post micro-tasks using AI requirements analysis and hire top university talent.
          </p>
        </div>

        <Link
          href="/client/tasks/create"
          className="px-5 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" /> Post New Task (AI)
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Open Micro-Tasks</span>
            <Briefcase className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {openTasksCount}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Accepting student bids</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Applications Received</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalApplications}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total student applicants</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Tasks Posted</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {tasks?.length || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active + Completed</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Verification Status</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-extrabold text-emerald-600 capitalize">
            {profile?.verification_status || "Verified"}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Client identity clear</p>
        </div>
      </div>

      {/* Main Content: Client Active Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Posted Micro-Tasks</h2>
          <Link href="/client/tasks/create" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            + Post Another Task
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading client tasks...</div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {t.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      t.status === "open" ? "bg-emerald-500/20 text-emerald-600" : "bg-slate-200 text-slate-700"
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <Link href={`/client/tasks/${t.id}`}>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
                      {t.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {t.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                    <span>Budget: ₹{t.budget_min} - ₹{t.budget_max}</span>
                    <span>Est. Time: {t.estimated_hours} hrs</span>
                    <span className="text-indigo-600 font-bold">{t.applications_count || 0} Applications</span>
                  </div>
                </div>

                <Link
                  href={`/client/tasks/${t.id}`}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 flex items-center gap-1.5 shrink-0"
                >
                  Manage & Matches <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">You haven&apos;t posted any micro-tasks yet</p>
            <Link
              href="/client/tasks/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-md"
            >
              <Sparkles className="w-4 h-4" /> Post First Task with AI Analysis
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
