import React from "react";
import Link from "next/link";
import { Wallet, Heart, ShieldCheck, Sparkles, Code } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-white font-bold">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Skill2<span className="text-emerald-400">Pocket</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering university students to monetize skills through micro-tasks matched with AI availability and proficiency algorithms.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Students</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/student/tasks" className="hover:text-indigo-400 transition-colors">Browse Micro-Tasks</Link></li>
              <li><Link href="/register?role=student" className="hover:text-indigo-400 transition-colors">Create Student Profile</Link></li>
              <li><Link href="/student/dashboard" className="hover:text-indigo-400 transition-colors">Student Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Clients</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/client/tasks/create" className="hover:text-emerald-400 transition-colors">Post Task with AI</Link></li>
              <li><Link href="/register?role=client" className="hover:text-emerald-400 transition-colors">Client Registration</Link></li>
              <li><Link href="/client/dashboard" className="hover:text-emerald-400 transition-colors">Manage Applications</Link></li>
            </ul>
          </div>

          {/* AI Matching Feature */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Hybrid AI Matching Engine
            </div>
            <p className="text-xs text-slate-300">
              Evaluates skill proficiency, deadline feasibility, reliability history, and weekly availability schedules.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Skill2Pocket Marketplace. Built for Indian University Students.</p>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL & Supabase Auth
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
