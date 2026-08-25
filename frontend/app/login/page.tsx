"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { parseApiError } from "@/lib/api";
import { Wallet, LogIn, User, Briefcase, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      setError(parseApiError(err, "Invalid email address or password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, "password123");
    } catch (err: any) {
      setError(parseApiError(err, "Demo login failed. Please verify credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 mx-auto flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
          <Wallet className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Welcome back to Skill2Pocket</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to access your dashboard and tasks</p>
      </div>

      {/* Demo Seed Account Quick Buttons */}
      <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-950/40 dark:to-emerald-950/40 p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 space-y-2">
        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
          ⚡ One-Click Demo Accounts
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin("student@test.com")}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-left border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all text-xs font-medium"
          >
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              Test Student
            </div>
            <p className="text-[10px] text-slate-500 truncate">student@test.com</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin("client@test.com")}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-left border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all text-xs font-medium"
          >
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
              Test Client
            </div>
            <p className="text-[10px] text-slate-500 truncate">client@test.com</p>
          </button>
        </div>
      </div>


      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="aarav.student@skill2pocket.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Signing in..." : <><LogIn className="w-4 h-4" /> Sign In</>}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}

