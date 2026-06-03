"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DPSLogo from "@/components/ui/DPSLogo";
import Link from "next/link";
import { LogIn, AlertCircle, ArrowLeft, Key } from "lucide-react";

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push(`/portal/${user.role.toLowerCase()}`);
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(email.trim(), password);

    if (result.success) {
      // AuthContext handles redirecting or setting state. We'll direct based on role:
      const savedUser = localStorage.getItem("dps_session");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        router.push(`/portal/${u.role.toLowerCase()}`);
      }
    } else {
      setError(result.error || "Failed to authenticate");
      setIsSubmitting(false);
    }
  };

  // Helper to autofill for testing
  const autofill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative select-none">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0B7A3B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Website
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <DPSLogo size={72} variant="dark" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-white tracking-tight">
          DPS Damanjodi Portal
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-400">
          Enter administrative or student account credentials to log in.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-800 py-8 px-6 sm:px-10 border border-slate-700 rounded-xl shadow-xl space-y-6">
          {error && (
            <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-lg flex items-start gap-2.5 text-red-300 text-xs leading-normal">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-slate-300">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm border border-slate-700 bg-slate-900 rounded p-2.5 focus:ring focus:outline-none text-white"
                placeholder="e.g. student@dpsdamanjodi.edu.in"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400">Password</label>
                <a href="#" className="text-[10px] text-primary hover:underline">Forgot password?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm border border-slate-700 bg-slate-900 rounded p-2.5 focus:ring focus:outline-none text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-md font-bold text-sm shadow transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <LogIn size={16} />
              {isSubmitting ? "Authenticating Session..." : "Secure Login"}
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="border-t border-slate-700 pt-6 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Key size={12} /> Test Credentials (Autofill)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => autofill("admin@dpsdamanjodi.edu.in", "admin123")}
                className="bg-slate-900/50 hover:bg-slate-900 border border-slate-700 text-left px-3 py-2 rounded text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-400 leading-none">Admin</div>
                <div className="text-[9px] text-slate-500 mt-1 select-none leading-none">sujata.mohapatra</div>
              </button>
              <button
                type="button"
                onClick={() => autofill("teacher@dpsdamanjodi.edu.in", "teacher123")}
                className="bg-slate-900/50 hover:bg-slate-900 border border-slate-700 text-left px-3 py-2 rounded text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-400 leading-none">Teacher</div>
                <div className="text-[9px] text-slate-500 mt-1 select-none leading-none">sunita.sharma</div>
              </button>
              <button
                type="button"
                onClick={() => autofill("student@dpsdamanjodi.edu.in", "student123")}
                className="bg-slate-900/50 hover:bg-slate-900 border border-slate-700 text-left px-3 py-2 rounded text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-400 leading-none">Student</div>
                <div className="text-[9px] text-slate-500 mt-1 select-none leading-none">rahul.mohanty</div>
              </button>
              <button
                type="button"
                onClick={() => autofill("parent@dpsdamanjodi.edu.in", "parent123")}
                className="bg-slate-900/50 hover:bg-slate-900 border border-slate-700 text-left px-3 py-2 rounded text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-400 leading-none">Parent</div>
                <div className="text-[9px] text-slate-500 mt-1 select-none leading-none">ramesh.mohanty</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
