"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Lock, AlertCircle, CheckCircle, Loader2, ArrowLeft } from "lucide-react";

export default function ChangePasswordPage() {
  const { user: dbUser, isLoading: dbUserLoading } = useAuth();
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const initTriggered = useRef(false);

  useEffect(() => {
    if (!dbUserLoading && !dbUser) {
      router.push("/sign-in");
      return;
    }

    if (!dbUser || initTriggered.current) return;
    initTriggered.current = true;

    const sendOtpCode = async () => {
      const email = dbUser.email;
      try {
        const res = await fetch("/api/auth/request-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          setSuccessMsg(`A verification code (OTP) has been sent to ${email} to authorize this change.`);
        } else {
          setErrorMsg(data.error || "Failed to send verification code.");
        }
      } catch (err) {
        console.error("Failed to send OTP code:", err);
        setErrorMsg("Failed to send verification code. Please reload the page.");
      } finally {
        setIsInitializing(false);
      }
    };

    sendOtpCode();
  }, [dbUser, dbUserLoading, router]);

  const handleResendOtp = async () => {
    if (!dbUser) return;
    setErrorMsg("");
    setSuccessMsg("");
    setIsInitializing(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: dbUser.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`A new verification code (OTP) has been sent to ${dbUser.email}.`);
      } else {
        setErrorMsg(data.error || "Failed to resend verification code.");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setErrorMsg("Failed to resend verification code.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: dbUser.email, otp, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("Password changed successfully!");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          router.push(`/portal/${dbUser.role.toLowerCase()}`);
        }, 1500);
      } else {
        setErrorMsg(data.error || "Verification was incomplete. Please check code.");
      }
    } catch (err) {
      console.error("Change password failed:", err);
      setErrorMsg("An error occurred updating your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (dbUserLoading || !dbUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center mb-6 px-4">
        <div className="flex justify-center">
          <img
            src="/logo-banner.png"
            alt="Delhi Public School Damanjodi Logo"
            className="w-full max-w-[340px] h-auto object-contain rounded-lg shadow-sm border border-slate-200/50 bg-white p-1"
          />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-slate-800 text-lg font-bold tracking-tight">Change Password</h2>
            <p className="text-slate-500 text-xs mt-1">
              Verify your identity via OTP to update your login credentials
            </p>
          </div>

          {isInitializing ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Sending OTP verification...</span>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-semibold shadow-sm animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 font-semibold shadow-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 text-xs font-bold flex justify-between items-center">
                    <span>Verification Code (OTP)</span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-primary hover:underline text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit OTP code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm p-2.5 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 text-xs font-bold flex items-center gap-1.5">
                    <Lock size={13} className="text-slate-400" />
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm p-2.5 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 text-xs font-bold flex items-center gap-1.5">
                    <Lock size={13} className="text-slate-400" />
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm p-2.5 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-emerald-700 text-white py-3 rounded-lg font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
