"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TaskAnalyzeResponse } from "@/lib/types";
import { Sparkles, ArrowLeft, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";

export default function CreateTaskPage() {
  const router = useRouter();

  // Raw description for AI parsing
  const [naturalDesc, setNaturalDesc] = useState(
    "I need someone to build a Python script that scrapes product prices from 5 Indian e-commerce websites into a JSON file. I need it by tomorrow evening. Budget is ₹1500."
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<TaskAnalyzeResponse | null>(null);

  // Form Fields (Editable after AI analysis)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Programming");
  const [budgetMin, setBudgetMin] = useState(1000);
  const [budgetMax, setBudgetMax] = useState(1500);
  const [estimatedHours, setEstimatedHours] = useState(3.5);
  const [workMode, setWorkMode] = useState("remote");
  const [deadlineDays, setDeadlineDays] = useState(2);
  const [skills, setSkills] = useState<{ name: string; required_level: string; importance: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // AI Task Parser Mutation
  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await api.post("/tasks/analyze", { description: text });
      return res.data;
    },
    onSuccess: (data: TaskAnalyzeResponse) => {
      setAnalyzedData(data);
      setTitle(data.title);
      setDescription(naturalDesc);
      setCategory(data.category || "Programming");
      setBudgetMin(data.suggested_budget_min || 1000);
      setBudgetMax(data.suggested_budget_max || 1800);
      setEstimatedHours(data.estimated_hours || 3.5);
      setDeadlineDays(data.deadline_days || 2);
      
      const formattedSkills = data.skills?.map(s => ({
        name: s.name,
        required_level: s.level || "intermediate",
        importance: "must_have"
      })) || [];
      setSkills(formattedSkills);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || "AI Task Analysis failed. You can enter task details manually below.");
    }
  });

  const handleAnalyzeClick = () => {
    if (!naturalDesc.trim() || naturalDesc.length < 10) {
      setErrorMsg("Please enter a description of at least 10 characters.");
      return;
    }
    setErrorMsg(null);
    setAnalyzing(true);
    analyzeMutation.mutate(naturalDesc, {
      onSettled: () => setAnalyzing(false)
    });
  };

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/tasks", payload);
      return res.data;
    },
    onSuccess: (data) => {
      alert("Micro-task published successfully!");
      router.push(`/client/tasks/${data.id}`);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || "Failed to publish task.");
    }
  });

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setErrorMsg("Task title and description are required.");
      return;
    }

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + Number(deadlineDays));

    const payload = {
      title,
      description,
      category,
      budget_min: Number(budgetMin),
      budget_max: Number(budgetMax),
      deadline: deadlineDate.toISOString(),
      estimated_hours: Number(estimatedHours),
      work_mode: workMode,
      skills: skills.map(s => ({
        name: s.name,
        required_level: s.required_level,
        importance: s.importance
      }))
    };

    createTaskMutation.mutate(payload);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
          <Sparkles className="w-4 h-4" /> AI Assisted Micro-Task Creator
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create a New Micro-Task</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Describe what you need in plain natural language. Our AI will automatically extract requirements, skills, budget, and estimated time.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Natural Language AI Description Input */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white space-y-4 shadow-xl border border-slate-800">
        <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
          Step 1: Describe Your Task Naturally
        </label>
        <textarea
          rows={3}
          value={naturalDesc}
          onChange={(e) => setNaturalDesc(e.target.value)}
          placeholder="Example: I need a Python script to scrape product prices from 5 e-commerce sites by tomorrow evening. Budget is ₹1500."
          className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">Powered by Ollama / OpenAI AI Abstraction</span>
          <button
            type="button"
            onClick={handleAnalyzeClick}
            disabled={analyzing}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            {analyzing ? "Analyzing Task with AI..." : "Analyze Task Requirements"}
          </button>
        </div>
      </div>

      {/* Step 2: Review Extracted Requirements & Edit */}
      <form onSubmit={handlePublishSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Step 2: Review & Customize Task Parameters
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Python E-Commerce Price Scraper"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
            >
              <option value="Programming">Programming</option>
              <option value="Web Development">Web Development</option>
              <option value="Design">Design</option>
              <option value="Writing">Writing</option>
              <option value="Media & Video">Media & Video</option>
              <option value="Data Science">Data Science</option>
              <option value="Tutoring">Tutoring</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on_site">On Site</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Budget (₹)</label>
            <input
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Budget (₹)</label>
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Est. Duration (hrs)</label>
            <input
              type="number"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Detailed Task Description</label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Extracted Required Skills List */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Extracted Required Skills & Importance
          </label>
          {skills.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                value={s.name}
                onChange={(e) => {
                  const updated = [...skills];
                  updated[idx].name = e.target.value;
                  setSkills(updated);
                }}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
              />
              <select
                value={s.required_level}
                onChange={(e) => {
                  const updated = [...skills];
                  updated[idx].required_level = e.target.value;
                  setSkills(updated);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                type="button"
                onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                className="text-slate-400 hover:text-rose-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setSkills([...skills, { name: "Python", required_level: "intermediate", importance: "must_have" }])}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Another Required Skill
          </button>
        </div>

        <button
          type="submit"
          disabled={createTaskMutation.isPending}
          className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all"
        >
          {createTaskMutation.isPending ? "Publishing Task..." : "Publish Task & Find Matches"}
        </button>
      </form>
    </div>
  );
}
