"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Application } from "@/lib/types";
import { Send, CheckCircle2, Clock, ExternalLink, AlertCircle, Sparkles } from "lucide-react";

export default function StudentApplicationsPage() {
  const { user } = useAuth();
  const studentId = user?.profile_id;
  const queryClient = useQueryClient();

  const [activeTaskForDeliverable, setActiveTaskForDeliverable] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionDesc, setSubmissionDesc] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["student_applications", studentId],
    queryFn: async () => {
      const res = await api.get(`/students/${studentId}/applications`);
      return res.data;
    },
    enabled: !!studentId
  });

  const submitDeliverableMutation = useMutation({
    mutationFn: async (payload: { task_id: string; submission_url: string; description: string }) => {
      const res = await api.post(`/tasks/${payload.task_id}/submit`, {
        submission_url: payload.submission_url,
        description: payload.description
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student_applications"] });
      setActiveTaskForDeliverable(null);
      setSubmissionUrl("");
      setSubmissionDesc("");
      alert("Deliverable submitted successfully! The client will review your submission.");
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || "Failed to submit deliverable.");
    }
  });

  const handleSubmitDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!activeTaskForDeliverable || !submissionUrl) {
      setErrorMsg("Please provide a deliverable submission URL.");
      return;
    }
    submitDeliverableMutation.mutate({
      task_id: activeTaskForDeliverable,
      submission_url: submissionUrl,
      description: submissionDesc
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Applications & Deliverables</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track proposal statuses and submit completed work for accepted micro-tasks.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading applications...</div>
      ) : applications && applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    app.status === "accepted"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : app.status === "rejected"
                      ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                      : "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                  }`}>
                    {app.status}
                  </span>
                  <span className="text-xs text-slate-400">Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {app.task_title || "Micro Task"}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  <b>Proposal:</b> {app.proposal}
                </p>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                  <span>Price: ₹{app.proposed_price}</span>
                  <span>Est. Time: {app.estimated_completion_time}</span>
                </div>
              </div>

              {/* Action Button for Accepted Applications */}
              {app.status === "accepted" && (
                <button
                  onClick={() => setActiveTaskForDeliverable(app.task_id)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20 flex items-center gap-2 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Deliverables
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No applications submitted yet</p>
          <p className="text-xs text-slate-500">Browse the marketplace and apply to your first task!</p>
        </div>
      )}

      {/* Deliverable Submission Modal */}
      {activeTaskForDeliverable && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Submit Deliverables</h3>
              <button onClick={() => setActiveTaskForDeliverable(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitDeliverable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deliverable URL (GitHub repo, Figma, Google Drive, Loom)
                </label>
                <input
                  type="url"
                  required
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://github.com/username/project-repo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Submission Notes / Instructions
                </label>
                <textarea
                  rows={3}
                  value={submissionDesc}
                  onChange={(e) => setSubmissionDesc(e.target.value)}
                  placeholder="Explain what has been completed and how the client can test/review your work..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTaskForDeliverable(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitDeliverableMutation.isPending}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-500/20"
                >
                  {submitDeliverableMutation.isPending ? "Submitting..." : "Submit Deliverable"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
