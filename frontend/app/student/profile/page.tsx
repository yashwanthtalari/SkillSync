"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StudentProfile } from "@/lib/types";
import { SkillBadge } from "@/components/SkillBadge";
import { User, ShieldCheck, Plus, Clock, Save, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export default function StudentProfilePage() {
  const { user } = useAuth();
  const studentId = user?.profile_id;
  const queryClient = useQueryClient();

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Programming");
  const [newSkillLevel, setNewSkillLevel] = useState("intermediate");

  const [hourlyRate, setHourlyRate] = useState<number>(400);
  const [bio, setBio] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery<StudentProfile>({
    queryKey: ["student_profile", studentId],
    queryFn: async () => {
      const res = await api.get(`/students/${studentId}`);
      if (res.data) {
        setHourlyRate(res.data.hourly_rate || 400);
        setBio(res.data.bio || "");
      }
      return res.data;
    },
    enabled: !!studentId
  });

  // Add Skill Mutation
  const addSkillMutation = useMutation({
    mutationFn: async (payload: { skill_name: string; category: string; proficiency_level: string }) => {
      const res = await api.post(`/students/${studentId}/skills`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student_profile"] });
      setNewSkillName("");
      setMsg("Skill added successfully!");
    }
  });

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: { hourly_rate: number; bio: string }) => {
      const res = await api.put(`/students/${studentId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student_profile"] });
      setMsg("Profile updated successfully!");
    }
  });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    addSkillMutation.mutate({
      skill_name: newSkillName.trim(),
      category: newSkillCategory,
      proficiency_level: newSkillLevel
    });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      hourly_rate: Number(hourlyRate),
      bio: bio
    });
  };

  if (isLoading || !profile) {
    return <div className="py-12 text-center text-slate-400">Loading student profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Student Profile & Skills</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your technical skills, hourly rate, and weekly availability schedule.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" /> Verified Student
        </span>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Main Profile Info Form */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={profile.full_name}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">University & Degree</label>
              <input
                type="text"
                disabled
                value={`${profile.university} (${profile.degree})`}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hourly Rate (₹/hr)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Mode Preference</label>
              <select
                disabled
                value={profile.work_mode}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm capitalize"
              >
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="on_site">On Site</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Student Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio describing your background, skills, and portfolio projects..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        </form>
      </div>

      {/* Add & Manage Skills */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Technical & Creative Skills</h2>

        <div className="flex flex-wrap gap-2">
          {profile.skills?.map((s) => (
            <span key={s.id} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
              <span>{s.skill_name}</span>
              <span className="text-[10px] text-indigo-400 uppercase font-bold">({s.proficiency_level})</span>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddSkill} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Add New Skill</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. Python, React, Canva, CapCut, SQL"
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
            >
              <option value="Programming">Programming</option>
              <option value="Web Development">Web Development</option>
              <option value="Design">Design</option>
              <option value="Writing">Writing</option>
              <option value="Media & Video">Media & Video</option>
              <option value="Data Science">Data Science</option>
              <option value="Tutoring">Tutoring</option>
            </select>

            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={addSkillMutation.isPending}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Skill
          </button>
        </form>
      </div>
    </div>
  );
}
