"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Task, StudentProfile, Application } from "@/lib/types";
import { TaskCard } from "@/components/TaskCard";
import { MatchBadge } from "@/components/MatchBadge";
import { ShieldCheck, Award, Clock, IndianRupee, Sparkles, CheckCircle2, Search, ArrowRight, User } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();

  const studentId = user?.profile_id;

  // Fetch Student Profile
  const { data: profile } = useQuery<StudentProfile>({
    queryKey: ["student_profile", studentId],
    queryFn: async () => {
      const res = await api.get(`/students/${studentId}`);
      return res.data;
    },
    enabled: !!studentId
  });

  // Fetch Recommended Tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["tasks_recommended"],
    queryFn: async () => {
      const res = await api.get("/tasks?status=open");
      return res.data;
    }
  });

  // Fetch Student Applications
  const { data: applications } = useQuery<Application[]>({
    queryKey: ["student_applications", studentId],
    queryFn: async () => {
      const res = await api.get(`/students/${studentId}/applications`);
      return res.data;
    },
    enabled: !!studentId
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-800/60 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified University Student
              </span>
              <span className="text-xs text-slate-400">• {profile?.university || "University"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-emerald-400">{profile?.full_name || user?.full_name || "Student"}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Your profile is matched with {tasks?.length || 0} active micro-tasks matching your skills and availability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student/profile"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Update Skills & Schedule
            </Link>
            <Link
              href="/student/tasks"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/30 transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Reliability Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {profile?.reliability_score || 95.0}%
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Excellent track record</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {profile?.completed_tasks || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tasks delivered on time</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Average Rating</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1">
            {profile?.average_rating || 5.0} <span className="text-amber-500 text-lg">★</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">From client reviews</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <span>Hourly Rate</span>
            <IndianRupee className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{profile?.hourly_rate || 350}/hr
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Standard rate limit</p>
        </div>
      </div>

      {/* Main Grid: AI Recommended Tasks + Active Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Tasks (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recommended Tasks</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                AI Matched
              </span>
            </div>
            <Link href="/student/tasks" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {tasksLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading tasks...</div>
          ) : tasks && tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.slice(0, 4).map((t, idx) => (
                <TaskCard key={t.id} task={t} matchScore={92 - idx * 4} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center text-slate-500">
              No tasks currently open. Check back soon!
            </div>
          )}
        </div>

        {/* Sidebar: Active Applications & Skills summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Applications</h3>
              <Link href="/student/applications" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>

            {applications && applications.length > 0 ? (
              <div className="space-y-3">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                        {app.task_title || "Micro Task"}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        app.status === "accepted" ? "bg-emerald-500/20 text-emerald-600" : "bg-indigo-500/20 text-indigo-600"
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Price: ₹{app.proposed_price}</span>
                      <span>{app.estimated_completion_time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2">No active applications. Browse tasks to submit your first proposal!</p>
            )}
          </div>

          {/* Student Skills Summary */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Your Skills</h3>
              <Link href="/student/profile" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                + Add Skill
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((s) => (
                  <span key={s.id} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {s.skill_name} <span className="text-[10px] text-indigo-400 capitalize">({s.proficiency_level})</span>
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-500">No skills added yet. Go to profile to add skills!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
