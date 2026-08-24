"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ClientProfile } from "@/lib/types";
import { Briefcase, ShieldCheck, Save, CheckCircle2 } from "lucide-react";

export default function ClientProfilePage() {
  const { user } = useAuth();
  const clientId = user?.profile_id;
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [bio, setBio] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery<ClientProfile>({
    queryKey: ["client_profile", clientId],
    queryFn: async () => {
      const res = await api.get(`/clients/${clientId}`);
      if (res.data) {
        setFullName(res.data.full_name || "");
        setOrgName(res.data.organization_name || "");
        setBio(res.data.bio || "");
      }
      return res.data;
    },
    enabled: !!clientId
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { full_name: string; organization_name: string; bio: string }) => {
      const res = await api.put(`/clients/${clientId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_profile"] });
      setMsg("Client profile updated successfully!");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      full_name: fullName,
      organization_name: orgName,
      bio: bio
    });
  };

  if (isLoading || !profile) {
    return <div className="py-12 text-center text-slate-400">Loading client profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Organization Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your company details and hiring profile information.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" /> Verified Client
        </span>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization / Company Name</label>
          <input
            type="text"
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Description / Bio</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md flex items-center gap-2"
        >
          <Save className="w-3.5 h-3.5" /> Save Profile
        </button>
      </form>
    </div>
  );
}
