"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Task, MatchRecommendation } from "@/lib/types";
import { MatchBadge } from "@/components/MatchBadge";
import { SkillBadge } from "@/components/SkillBadge";
import { Clock, IndianRupee, Calendar, Building2, ShieldCheck, CheckCircle2, ArrowLeft, Send, AlertCircle } from "lucide-react";

export default function TaskDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [proposal, setProposal] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [completionTime, setCompletionTime] = useState("1-2 days");
  const [applyError, setApplyError] = useState<string | null>(null);

  // Fetch Task details
  const { data: task, isLoading } = useQuery<Task>({
    queryKey: ["task", id],
    queryFn: async () => {
      const res = await api.get(`/tasks/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  // Submit Application Mutation
  const applyMutation = useMutation({
    mutationFn: async (payload: { proposal: string; proposed_price: number; estimated_completion_time: string }) => {
      const res = await api.post(`/tasks/${id}/applications`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student_applications"] });
      setShowApplyModal(false);
      alert("Application submitted successfully!");
      router.push("/student/applications");
    },
    onError: (err: any) => {
      setApplyError(err.response?.data?.detail || "Failed to submit application.");
    }
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);
    if (!proposal || !proposedPrice) {
      setApplyError("Please complete all proposal fields.");
      return;
    }
    applyMutation.mutate({
      proposal,
      proposed_price: Number(proposedPrice),
      estimated_completion_time: completionTime
    });
  };

  if (isLoading || !task) {
    return <div className="py-12 text-center text-slate-400">Loading task details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </button>

      {/* Main Task Detail Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {task.category}
              </span>
              <MatchBadge score={92} size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {task.title}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Posted by <b>{task.organization_name || task.client_name || "Client"}</b></span>
              <span className="text-emerald-500 font-semibold">• Verified Client</span>
            </div>
          </div>

          <button
            onClick={() => {
              setProposedPrice(task.budget_min.toString());
              setShowApplyModal(true);
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 shrink-0"
          >
            Apply for this Task
          </button>
        </div>

        {/* Task Metadata Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Budget Range</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              ₹{task.budget_min} - ₹{task.budget_max}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Estimated Duration</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              <Clock className="w-4 h-4 text-indigo-500" /> {task.estimated_hours} Hours
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Deadline</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              <Calendar className="w-4 h-4 text-amber-500" />
              {new Date(task.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Work Mode</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white capitalize">
              {task.work_mode.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Task Description */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Task Description</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {task.description}
          </p>
        </div>

        {/* Required Skills */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Required Skills & Proficiency</h3>
          <div className="flex flex-wrap gap-2">
            {task.required_skills?.map((s) => (
              <span key={s.id} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                <span>{s.skill_name}</span>
                <span className="text-[10px] text-indigo-400 uppercase">({s.required_level})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Submit Proposal</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {applyError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Proposal / Approach
                </label>
                <textarea
                  required
                  rows={4}
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  placeholder="Describe your relevant experience and how you plan to complete this micro-task..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Proposed Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    required
                    value={completionTime}
                    onChange={(e) => setCompletionTime(e.target.value)}
                    placeholder="e.g. 3 hours, 2 days"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyMutation.isPending}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-500/20"
                >
                  {applyMutation.isPending ? "Submitting..." : "Send Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
