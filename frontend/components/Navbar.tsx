"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "./ThemeToggle";
import { Wallet, Briefcase, PlusCircle, User, LogOut, Sparkles, CheckCircle2, Menu, X } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Skill2<span className="text-emerald-500">Pocket</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
                Student Task Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-5">
            {!user ? (
              <>
                <Link href="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/student/tasks" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors">
                  Browse Tasks
                </Link>
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                  <ThemeToggle />
                  <Link href="/login" className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-200 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-sm shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50">
                    Get Started
                  </Link>
                </div>
              </>
            ) : user.role === "student" ? (
              <>
                <Link href="/student/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/student/tasks" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors">
                  Marketplace
                </Link>
                <Link href="/student/applications" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors">
                  My Applications
                </Link>
                <Link href="/student/profile" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors">
                  Profile & Skills
                </Link>
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                  <ThemeToggle />
                </div>
              </>
            ) : (
              <>
                <Link href="/client/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors">
                  Client Dashboard
                </Link>
                <Link href="/client/tasks/create" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm shadow-emerald-500/20 transition-all">
                  <Sparkles className="w-4 h-4" />
                  Post Task (AI)
                </Link>
                <Link href="/client/profile" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors">
                  Organization Profile
                </Link>
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                  <ThemeToggle />
                </div>
              </>
            )}

            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-700">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {user.role} Account
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </nav>

          {/* Mobile menu toggle & theme button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-3">
          {!user ? (
            <>
              <Link href="/" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200">Home</Link>
              <Link href="/student/tasks" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200">Browse Tasks</Link>
              <Link href="/login" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200">Sign In</Link>
              <Link href="/register" className="block py-2 text-sm font-semibold text-white bg-indigo-600 text-center rounded-xl">Get Started</Link>
            </>
          ) : user.role === "student" ? (
            <>
              <Link href="/student/dashboard" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200">Dashboard</Link>
              <Link href="/student/tasks" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200">Marketplace</Link>
              <Link href="/student/applications" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200">My Applications</Link>
              <Link href="/student/profile" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200">Profile</Link>
              <button onClick={logout} className="w-full text-left py-2 text-sm font-medium text-rose-600">Logout</button>
            </>
          ) : (
            <>
              <Link href="/client/dashboard" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200">Dashboard</Link>
              <Link href="/client/tasks/create" className="block py-2 text-sm font-semibold text-white bg-emerald-600 text-center rounded-xl">Post Task (AI)</Link>
              <Link href="/client/profile" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200">Profile</Link>
              <button onClick={logout} className="w-full text-left py-2 text-sm font-medium text-rose-600">Logout</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
