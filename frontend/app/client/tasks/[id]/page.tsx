"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Task, MatchRecommendation, Application } from "@/lib/types";
import { MatchBadge } from "@/components/MatchBadge";
import { Sparkles, Users, CheckCircle2, Clock, IndianRupee, Star, ShieldCheck, ArrowLeft, Send, ExternalLink, ThumbsUp, MessageSquare, Mail } from "lucide-react";

export default function ClientTaskManagePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"matches" | "applications" | "deliverables">("matches");
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState("Great communication and delivered ahead of schedule!");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedStudentForReview, setSelectedStudentForReview] = useState<string | null>(null);

  // Contact Student State
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactStudentName, setContactStudentName] = useState("");
  const [contactStudentId, setContactStudentId] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleSendContactMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactStudentId || !contactMsg.trim()) return;
    setContactSending(true);
    try {
      await api.post("/notifications/send", {
        recipient_user_id: contactStudentId,
        title: `Task Invitation: "${task?.title}"`,
        message: contactMsg,
        notification_type: "invitation"
      });
      setContactSuccess(true);
      setTimeout(() => {
        setContactSuccess(false);
        setShowContactModal(false);
      }, 2000);
    } catch (err: any) {
      alert("Failed to send message to student. Please try again.");
    } finally {
      setContactSending(false);
    }
  };


  // Fetch Task Details
  const { data: task, isLoading: taskLoading } = useQuery<Task>({
    queryKey: ["task", id],
    queryFn: async () => {
      const res = await api.get(`/tasks/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  // Fetch AI Recommended Matches
  const { data: matches, isLoading: matchesLoading } = useQuery<MatchRecommendation[]>({
    queryKey: ["task_matches", id],
    queryFn: async () => {
      const res = await api.get(`/tasks/${id}/matches`);
      return res.data;
    },
    enabled: !!id
  });

  // Fetch Applications
  const { data: applications } = useQuery<Application[]>({
    queryKey: ["task_applications", id],
    queryFn: async () => {
      const res = await api.get(`/tasks/${id}/applications`);
      return res.data;
    },
    enabled: !!id
  });

  // Application Status Update Mutation
  const updateAppMutation = useMutation({
    mutationFn: async (payload: { appId: string; status: string }) => {
      const res = await api.put(`/applications/${payload.appId}`, { status: payload.status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["task_applications", id] });
      alert("Application status updated!");
    }
  });

  // Approve Deliverable Mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/tasks/${id}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      setShowReviewModal(true);
    }
  });

  // Submit Review Mutation
  const reviewMutation = useMutation({
    mutationFn: async (payload: { task_id: string; reviewee_id: string; rating: number; comment: string }) => {
      const res = await api.post("/reviews", payload);
      return res.data;
    },
    onSuccess: () => {
      setShowReviewModal(false);
      alert("Review submitted successfully! Thank you for rating the student.");
    }
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acceptedApp = applications?.find(a => a.status === "accepted");
    const studentUserId = acceptedApp?.student_id || selectedStudentForReview;
    if (!studentUserId) return;

    reviewMutation.mutate({
      task_id: id,
      reviewee_id: studentUserId,
      rating: ratingVal,
      comment: reviewComment
    });
  };

  if (taskLoading || !task) {
    return <div className="py-12 text-center text-slate-400">Loading task management view...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Client Dashboard
      </button>

      {/* Task Header Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {task.category}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                task.status === "completed" ? "bg-emerald-500/20 text-emerald-600" : "bg-indigo-500/20 text-indigo-600"
              }`}>
                Status: {task.status}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{task.title}</h1>
            <p className="text-xs text-slate-500 mt-1">Budget: ₹{task.budget_min} - ₹{task.budget_max} • Est. Time: {task.estimated_hours} hrs</p>
          </div>

          {task.status === "submitted" && (
            <button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-md flex items-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" /> Approve Deliverable & Complete
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("matches")}
          className={`pb-3 px-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === "matches"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-500" /> AI Recommended Matches ({matches?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-3 px-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === "applications"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Users className="w-4 h-4" /> Applications ({applications?.length || 0})
        </button>
      </div>

      {/* TAB 1: AI Recommended Matches Ranking */}
      {activeTab === "matches" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Multi-Signal AI Matching Engine Results
            </span>
            <p>Students ranked by skills overlap, availability schedules, deadline feasibility, budget compatibility, and past reliability scores.</p>
          </div>

          {matchesLoading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Calculating student matches...</div>
          ) : matches && matches.length > 0 ? (
            <div className="space-y-4">
              {matches.map((m, idx) => (
                <div key={m.student_id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 text-white font-extrabold flex items-center justify-center text-sm">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">{m.student_name}</h3>
                          <span className="text-xs text-slate-400">• {m.university}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span>Rating: <b>{m.average_rating} ★</b></span>
                          <span>Reliability: <b>{m.reliability_score}%</b></span>
                        </div>
                      </div>
                    </div>

                    <MatchBadge score={m.overall_score} size="lg" />
                  </div>

                  {/* Explanation Breakdown */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                      Match Insights:
                    </span>
                    <p>{m.explanation}</p>
                    <div className="grid grid-cols-4 gap-2 pt-2 text-[11px] font-mono text-slate-500 border-t border-slate-200/60 dark:border-slate-700">
                      <span>Skill: {m.skill_score}%</span>
                      <span>Avail: {m.availability_score}%</span>
                      <span>Deadline: {m.deadline_score}%</span>
                      <span>Reliability: {m.reliability_score}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 font-medium">Ranked #{idx + 1} Candidate</span>
                    <button
                      onClick={() => {
                        setContactStudentId(m.student_id);
                        setContactStudentName(m.student_name);
                        setContactMsg(`Hi ${m.student_name}, your profile is a ${m.overall_score}% AI match for our task '${task.title}'! We'd love to invite you to discuss project details.`);
                        setShowContactModal(true);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Contact Student
                    </button>
                  </div>
                </div>
              ))}
            </div>

          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">No matches calculated yet.</div>
          )}
        </div>
      )}

      {/* TAB 2: Applications Manager */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {applications && applications.length > 0 ? (
            applications.map((app) => (
              <div key={app.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{app.student_name}</h3>
                      <span className="text-xs text-slate-400">• {app.student_university}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>Rating: {app.student_rating} ★</span>
                      <span>Reliability: {app.student_reliability}%</span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    app.status === "accepted" ? "bg-emerald-500/20 text-emerald-600" : "bg-indigo-500/20 text-indigo-600"
                  }`}>
                    {app.status}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">Proposal:</p>
                  <p>{app.proposal}</p>
                  <div className="flex items-center gap-4 mt-2 font-bold text-indigo-600">
                    <span>Proposed Price: ₹{app.proposed_price}</span>
                    <span>Est. Time: {app.estimated_completion_time}</span>
                  </div>
                </div>

                {app.status === "pending" && (
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => updateAppMutation.mutate({ appId: app.id, status: "rejected" })}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateAppMutation.mutate({ appId: app.id, status: "accepted" })}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20"
                    >
                      Accept Student & Hire
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">No applications submitted for this task yet.</div>
          )}
        </div>
      )}

      {/* Post-Completion Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Rate & Review Student</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingVal(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${
                        star <= ratingVal ? "text-amber-400" : "text-slate-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Feedback Comment</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Skip Review
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Student Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Contact & Invite Candidate: {contactStudentName}
                </h3>
              </div>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {contactSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Message & Task Invitation sent to {contactStudentName} successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSendContactMsg} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Message / Task Invitation
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Type your message to the candidate..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={contactSending}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {contactSending ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

