import React from "react";
import Link from "next/link";
import { Wallet, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Clock, Award, Users, Search, BrainCircuit } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-20 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white p-8 sm:p-14 shadow-2xl border border-indigo-800/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AI-Powered Student Micro-Task Marketplace
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
            Turn Your Skills Into <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">Pocket Money</span>.
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed">
            Skill2Pocket connects university students with quick client micro-tasks. Our multi-signal AI algorithm matches tasks based on your technical skills, weekly availability schedule, hourly rate, and deadline feasibility.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/student/tasks"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <Search className="w-4 h-4" />
              Find Micro-Tasks
            </Link>
            <Link
              href="/client/tasks/create"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              Post a Task (AI Parser)
            </Link>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> University Identity Verification</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" /> Real-time Availability Matching</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-400" /> Built-in Reputation & Reviews</span>
          </div>
        </div>
      </section>

      {/* Demo Credentials Quick-Start Banner */}
      <section className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white mb-1">
              Live Demo Accounts
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-emerald-200">
              Want to test instantly with pre-seeded data?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Log in as a Student (Aarav Sharma) or Client (Rajesh Agarwal) using pre-configured seed accounts.
            </p>
          </div>
          <Link
            href="/login"
            className="px-5 py-2.5 text-xs font-bold text-emerald-900 bg-emerald-300 hover:bg-emerald-200 rounded-xl transition-colors shrink-0"
          >
            Go to Login & Select Demo Account →
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">How Skill2Pocket Works</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Four simple steps from creating your student profile to getting paid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Create Profile",
              desc: "Register with your university email, add degree details, and specify your hourly rate.",
              icon: Users
            },
            {
              step: "02",
              title: "Set Skills & Availability",
              desc: "Add your tech/design skills with proficiency levels and select your available weekly hours.",
              icon: Clock
            },
            {
              step: "03",
              title: "Get AI Matched",
              desc: "Our matching engine calculates match score % based on skills, deadline, budget, and reliability.",
              icon: BrainCircuit
            },
            {
              step: "04",
              title: "Submit & Get Paid",
              desc: "Complete the task, submit deliverable link, receive client approval and rating review.",
              icon: Award
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs relative">
              <span className="text-xs font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md">
                {item.step}
              </span>
              <item.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 my-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Matching Architecture Feature Card */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Core Differentiator
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Not Just Keywords — Intelligent Multi-Signal Ranking
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Traditional freelance sites flood clients with hundreds of irrelevant bids. Skill2Pocket uses a multi-weighted formula:
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> <b>35% Skill Proficiency</b> — Required level vs student proficiency</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> <b>20% Availability Schedule</b> — Free time slots matching task urgency</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> <b>15% Deadline Feasibility</b> — Hours remaining vs estimated completion time</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> <b>10% Reliability Score</b> — Past task completion track record</li>
            </ul>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-4 font-mono text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <span className="font-bold text-emerald-400">Sample Match Explanation</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-sans font-bold">92.4% Match</span>
            </div>
            <div className="space-y-1 text-slate-300">
              <p>✔ Strong Python & Web Scraping proficiency (Expert vs Advanced)</p>
              <p>✔ Free Monday 14:00 - 20:00 IST (Available before deadline)</p>
              <p>✔ Student hourly rate ₹400/hr within client budget ₹1,500</p>
              <p>✔ 98.0 Reliability score across 12 completed micro-tasks</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
