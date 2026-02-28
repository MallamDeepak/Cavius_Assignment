"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { apiRequest } from "../lib/api";
import { CheckCircle2, Circle, Clock, Loader2, Sparkles, Trash2, Plus, LayoutDashboard, LogOut, Code, ArrowRight, Bot, Database, Zap, ChevronRight, ChevronDown } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
};

type Task = {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
};

type AuthResponse = {
  token: string;
  user: User;
};

function TaskStatusDropdown({ status, onChange }: { status: Task["status"]; onChange: (s: Task["status"]) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const styles = {
    todo: "bg-neutral-500/10 border-neutral-500/20 text-neutral-600",
    "in-progress": "bg-amber-50 border-amber-200 text-amber-600",
    done: "bg-emerald-50 border-emerald-200 text-emerald-600",
  };

  const labels = {
    todo: "To Do",
    "in-progress": "In Progress",
    done: "Done",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border outline-none min-w-[110px] justify-center transition-colors ${styles[status]}`}
      >
        {labels[status]} <ChevronDown className="w-3 h-3 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-black/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1.5 flex flex-col gap-0.5">
            <button
              onClick={() => { onChange("todo"); setIsOpen(false); }}
              className={`text-xs font-medium w-full text-left px-3 py-2 rounded-lg transition-colors ${status === "todo" ? "bg-neutral-500/10 text-neutral-700" : "text-neutral-500 hover:bg-black/5 hover:text-neutral-700"}`}
            >
              To Do
            </button>
            <button
              onClick={() => { onChange("in-progress"); setIsOpen(false); }}
              className={`text-xs font-medium w-full text-left px-3 py-2 rounded-lg transition-colors ${status === "in-progress" ? "bg-amber-50 text-amber-600" : "text-neutral-500 hover:bg-black/5 hover:text-amber-600"}`}
            >
              In Progress
            </button>
            <button
              onClick={() => { onChange("done"); setIsOpen(false); }}
              className={`text-xs font-medium w-full text-left px-3 py-2 rounded-lg transition-colors ${status === "done" ? "bg-emerald-50 text-emerald-600" : "text-neutral-500 hover:bg-black/5 hover:text-emerald-600"}`}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<"login" | "register" | "landing">("landing");
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  const [topic, setTopic] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'all' | 'single', taskId?: string } | null>(null);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    sessionStorage.setItem("appMode", mode);
  }, [mode]);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedMode = sessionStorage.getItem("appMode") as "login" | "register" | "landing" | null;

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser) as User);
      if (savedMode === "landing") {
        setMode("landing");
      } else {
        setMode("login"); // Default to workspace/login if they have a token
      }
    } else {
      if (savedMode) {
        setMode(savedMode);
      } else {
        setMode("landing");
      }
    }

    // Smooth initial load by delaying the check by a tiny bit
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const data = await apiRequest<Task[]>("/tasks", { token });
      setTasks(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadTasks();
  }, [token, loadTasks]);

  const taskCounts = useMemo(() => {
    return {
      todo: tasks.filter((task) => task.status === "todo").length,
      inProgress: tasks.filter((task) => task.status === "in-progress").length,
      done: tasks.filter((task) => task.status === "done").length,
    };
  }, [tasks]);

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = mode === "register" ? { name, email, password } : { email, password };
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      const data = await apiRequest<AuthResponse>(endpoint, { method: "POST", body });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setPassword("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setTaskLoading(true);

    try {
      await apiRequest<Task>("/tasks", {
        method: "POST",
        token,
        body: { title: taskTitle, description: taskDescription },
      });

      setTaskTitle("");
      setTaskDescription("");
      await loadTasks();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTaskLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    setError("");
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status } : t));

    try {
      await apiRequest<Task>(`/tasks/${taskId}`, {
        method: "PUT",
        token,
        body: { status },
      });
    } catch (err) {
      setError((err as Error).message);
      setTasks(previousTasks);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setDeleteConfirm({ type: 'single', taskId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'single' && deleteConfirm.taskId) {
      await executeDeleteTask(deleteConfirm.taskId);
    } else if (deleteConfirm.type === 'all') {
      await executeDeleteAllTasks();
    }
    setDeleteConfirm(null);
  };

  const executeDeleteTask = async (taskId: string) => {
    setError("");
    const previousTasks = [...tasks];
    setTasks(tasks.filter(t => t._id !== taskId));

    try {
      await apiRequest<null>(`/tasks/${taskId}`, {
        method: "DELETE",
        token,
      });
    } catch (err) {
      setError((err as Error).message);
      setTasks(previousTasks);
    }
  };

  const executeDeleteAllTasks = async () => {
    setError("");
    const previousTasks = [...tasks];
    setTasks([]);

    try {
      await Promise.all(
        previousTasks.map((t) =>
          apiRequest<null>(`/tasks/${t._id}`, {
            method: "DELETE",
            token,
          })
        )
      );
    } catch (err) {
      setError("Failed to delete all tasks. " + (err as Error).message);
      await loadTasks();
    }
  };

  const handleGenerateSuggestions = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setAiLoading(true);

    try {
      const data = await apiRequest<{ suggestions: string[] }>("/ai/task-suggestions", {
        method: "POST",
        token,
        body: { topic },
      });
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleUseSuggestion = (suggestion: string) => {
    setTaskTitle(suggestion);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUseAllSuggestions = async () => {
    setError("");
    setTaskLoading(true);
    try {
      await Promise.all(
        suggestions.map((title) =>
          apiRequest<Task>("/tasks", {
            method: "POST",
            token,
            body: { title, description: "" },
          })
        )
      );
      setSuggestions([]);
      await loadTasks();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTaskLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    setTasks([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin relative z-10" />
        </div>
        <p className="mt-6 text-sm font-medium text-neutral-600 animate-pulse tracking-widest uppercase">Initializing Workspace</p>
      </div>
    );
  }

  if (!token || !user || mode === "landing") {
    if (mode === "landing") {
      return (
        <div className="min-h-screen bg-[#FDFCF8] text-neutral-900 overflow-hidden selection:bg-indigo-500/30">
          <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#FDFCF8] to-[#FDFCF8] -z-10" />

          <nav className="border-b border-black/5 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setMode("landing")}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center p-[1px] shadow-lg shadow-indigo-500/20">
                  <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
                <span className="font-bold text-lg tracking-wide text-neutral-900">CaviusBoard</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                {token && user ? (
                  <button
                    onClick={() => setMode("login")}
                    className="text-sm font-bold bg-neutral-900 text-white hover:bg-neutral-800 px-5 py-2.5 rounded-full transition-all shadow-md"
                  >
                    Go to Workspace
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setMode("login")}
                      className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-3 sm:px-4 py-2"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setMode("register")}
                      className="text-sm font-bold bg-neutral-900 text-white hover:bg-neutral-800 px-5 py-2.5 rounded-full transition-all shadow-md"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-6 pt-24 pb-20 sm:pt-32 sm:pb-32 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-sm font-semibold mx-auto">
                <Sparkles className="w-4 h-4" />
                <span>Next-Gen Task Management</span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-500 bg-clip-text text-transparent pb-2">
                Organize Your Life.<br />Powered by AI.
              </h1>

              <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                CaviusBoard combines intuitive project workflow tracking with Google's Gemini Generative AI to map your massive goals into simple, actionable steps.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <button
                  onClick={() => setMode(token && user ? "login" : "register")}
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full font-bold transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-lg group"
                >
                  {token && user ? "Go to your workspace" : "Start your workspace"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#features"
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-neutral-100 border border-black/10 text-neutral-900 rounded-full font-bold transition-all text-center text-lg"
                >
                  Explore Features
                </a>
              </div>
            </div>
          </main>

          <section id="features" className="max-w-7xl mx-auto px-6 py-24 sm:py-32 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need to ship faster</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">Focus on the impactful work while the smart AI system builds the roadmap.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white border border-black/5 rounded-[2rem] p-8 hover:border-indigo-500/30 hover:bg-neutral-50 transition-all duration-500 group">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
                  <Bot className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Gemini AI Engine</h3>
                <p className="text-neutral-600 leading-relaxed text-sm">Tell the AI your broad ambition, and it will magically generate exactly 5 concise, actionable sub-tasks. Ready to instantly queue up.</p>
              </div>

              <div className="bg-white border border-black/5 rounded-[2rem] p-8 hover:border-emerald-500/30 hover:bg-neutral-50 transition-all duration-500 group">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                  <Database className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">MongoDB Sync</h3>
                <p className="text-neutral-600 leading-relaxed text-sm">Lightning fast and powerfully secure data synchronization powered by NoSQL. Your task states are always reliably stored and authenticated.</p>
              </div>

              <div className="bg-white border border-black/5 rounded-[2rem] p-8 hover:border-amber-500/30 hover:bg-neutral-50 transition-all duration-500 group">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-100 transition-all">
                  <Zap className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Blazing UX Design</h3>
                <p className="text-neutral-600 leading-relaxed text-sm">Crafted flawlessly on Next.js 14 via Tailwind CSS for fluid responsive layouts, micro-animations, glassmorphism logic, and total dark mode.</p>
              </div>
            </div>
          </section>

          <footer className="border-t border-black/5 py-12">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-neutral-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">CaviusBoard • Assignment Task</span>
              </div>
              <p className="text-xs text-neutral-600 font-medium">Built demonstrating modern full stack capabilities.</p>
            </div>
          </footer>
        </div>
      );
    }

    return (
      <main className="min-h-screen bg-[#FDFCF8] text-neutral-900 flex items-center justify-center p-4 selection:bg-indigo-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#FDFCF8] to-[#FDFCF8] -z-10" />

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          <button
            onClick={() => setMode("landing")}
            className="mb-8 flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors w-max mx-auto md:mx-0 md:absolute md:top-8 md:left-8 group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </button>

          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] shadow-2xl shadow-indigo-500/30 hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 border border-black/5 rounded-[2rem] p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -z-10" />

            <div className="text-center mb-8">
              <h1 className="text-3xl font-black bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent mb-2">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-neutral-500 text-sm font-medium">
                {mode === "login" ? "Enter your details to access your workspace" : "Sign up to start organizing your life"}
              </p>
            </div>

            <div className="flex p-1 bg-neutral-100 rounded-xl mb-8">
              <button
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${mode === "login" ? "bg-white text-indigo-600 shadow-md" : "text-neutral-500 hover:text-neutral-900"}`}
                onClick={() => setMode("login")}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${mode === "register" ? "bg-white text-indigo-600 shadow-md" : "text-neutral-500 hover:text-neutral-900"}`}
                onClick={() => setMode("register")}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-5" autoComplete="off">
              {mode === "register" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 block">Full Name</label>
                  <input
                    className="w-full bg-white border border-black/10 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-neutral-400 shadow-sm"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
                <input
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-neutral-400 shadow-sm"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 block">Password</label>
                <input
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-neutral-400 shadow-sm"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-xs text-red-600 text-center font-bold">{error}</p>
                </div>
              )}

              <button
                disabled={loading}
                className="w-full bg-gradient-to-tr from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 text-white rounded-xl py-3.5 font-bold text-sm transition-all duration-300 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 group"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "login" ? "Sign In to Workspace" : "Create Account"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </div>
        </div >
      </main >
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-neutral-900 selection:bg-indigo-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#FDFCF8] to-[#FDFCF8] pointer-events-none" />

      <nav className="border-b border-black/5 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setMode("landing")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <span className="font-bold text-lg tracking-wide text-neutral-900">CaviusBoard</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-neutral-600 bg-black/5 px-3 py-1.5 rounded-full border border-black/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {user.email}
            </div>
            <button
              onClick={handleLogout}
              className="text-neutral-600 hover:text-neutral-900 p-2 hover:bg-black/5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 relative">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "To Do", count: taskCounts.todo, icon: Circle, color: "text-neutral-600", bg: "bg-neutral-500/10", border: "border-neutral-500/20" },
            { label: "In Progress", count: taskCounts.inProgress, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
            { label: "Completed", count: taskCounts.done, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-black/5 rounded-2xl p-6 relative overflow-hidden group hover:border-black/10 transition-colors">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-semibold text-neutral-900">{stat.count}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.border} border flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols[1fr_1.5fr] xl:grid-cols-[400px_1fr] gap-8">
          <div className="space-y-6">
            <div className="bg-white border border-black/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[50px] pointer-events-none" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-indigo-500" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900">New Task</h2>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    required
                    className="w-full bg-[#F7F6F2] border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-neutral-500"
                  />
                </div>
                <div>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Add a description (optional)"
                    rows={3}
                    className="w-full bg-[#F7F6F2] border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-neutral-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={taskLoading}
                  className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl py-2.5 font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {taskLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Task
                </button>
              </form>
            </div>

            <div className="bg-white border border-indigo-200 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900">AI Assistant</h2>
              </div>

              <p className="text-sm text-indigo-800/70 mb-5 leading-relaxed">
                Stuck on a broad goal? Describe it, and I'll break it down into actionable tasks.
              </p>

              <form onSubmit={handleGenerateSuggestions} className="space-y-3 mb-6">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Launch a personal blog"
                  required
                  className="w-full bg-[#F7F6F2] border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-neutral-500 text-neutral-900"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="w-full bg-indigo-50 hover:bg-indigo-100/50 text-indigo-700 border border-indigo-200/50 rounded-xl py-2.5 font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Code className="w-4 h-4 text-indigo-600" />}
                  Generate Ideas
                </button>
              </form>

              {suggestions.length > 0 && (
                <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={handleUseAllSuggestions}
                      disabled={taskLoading}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1.5 bg-indigo-50 hover:bg-indigo-500/20 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      {taskLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      Use All
                    </button>
                  </div>
                  {suggestions.map((suggestion, idx) => (
                    <div key={idx} className="group relative bg-white border border-black/5 hover:border-indigo-500/30 rounded-xl p-3 pr-20 transition-all">
                      <p className="text-sm text-neutral-700 line-clamp-2 pr-4">{suggestion}</p>
                      <button
                        onClick={() => handleUseSuggestion(suggestion)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/10 hover:bg-indigo-500 text-neutral-900 rounded-lg px-3 py-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-black/5 rounded-3xl p-6 px-4 sm:px-6 shadow-xl w-full min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-black/5 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-neutral-600" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900">Your Workspace</h2>
              </div>

              {tasks.length > 0 && (
                <button
                  onClick={() => setDeleteConfirm({ type: 'all' })}
                  className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete All
                </button>
              )}
            </div>

            {tasks.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-black/5 rounded-2xl">
                <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-neutral-600" />
                </div>
                <h3 className="text-neutral-700 font-medium mb-1">No tasks yet</h3>
                <p className="text-sm text-neutral-500 max-w-[250px]">Create your first task or use AI to generate suggestions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...tasks].reverse().map((task) => (
                  <div key={task._id} className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-[#F7F6F2] border border-black/5 hover:border-black/10 rounded-2xl p-4 transition-all w-full">

                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium truncate mb-1 transition-colors ${task.status === "done" ? "text-neutral-500 line-through" : "text-neutral-800"}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-neutral-500 line-clamp-1">{task.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <TaskStatusDropdown
                        status={task.status}
                        onChange={(status) => handleStatusChange(task._id, status)}
                      />

                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-neutral-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
            }
          </div >
        </div >
      </main >

      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-black/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-red-500/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Delete {deleteConfirm.type === 'all' ? 'All Tasks' : 'Task'}?
            </h3>
            <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
              Are you sure you want to delete {deleteConfirm.type === 'all' ? 'all tasks' : 'this task'}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-black/5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-neutral-900 rounded-xl transition-colors shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
