"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DPSLogo from "@/components/ui/DPSLogo";
import Link from "next/link";
import Script from "next/script";
import { LogIn, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const { login, loginWithGoogle, verifyOtp, user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security elements state
  const [captcha, setCaptcha] = useState(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [tempEmail, setTempEmail] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push(`/portal/${user.role.toLowerCase()}`);
    }
  }, [user, isLoading, router]);

  // Fetch Mathematical Captcha
  const fetchCaptcha = async () => {
    try {
      const response = await fetch("/api/auth/captcha");
      const data = await response.json();
      if (data.success) {
        setCaptcha(data);
      }
    } catch (err) {
      console.error("Failed to load captcha", err);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  // Initialize Google Identity Button
  useEffect(() => {
    if (typeof window !== "undefined") {
      const initGoogle = () => {
        const google = (window ).google;
        if (google) {
          google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "645702096126-hgm4ic9kr2tld4idbqglvu06qbck9421.apps.googleusercontent.com",
            callback: handleGoogleCallback,
          });
          google.accounts.id.renderButton(
            document.getElementById("google-signin-btn"),
            { theme: "filled_blue", size: "large", width: 280, text: "signin_with" }
          );
        }
      };

      if ((window ).google) {
        initGoogle();
      } else {
        const interval = setInterval(() => {
          if ((window ).google) {
            initGoogle();
            clearInterval(interval);
          }
        }, 500);
        return () => clearInterval(interval);
      }
    }
  }, [captcha, captchaAnswer]); // Re-init button when state is ready so callbacks can access it

  const handleGoogleCallback = async (response) => {
    if (!captcha) {
      setError("Please wait for captcha to load.");
      return;
    }
    if (!captchaAnswer) {
      setError("Please answer the mathematical verification challenge first.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    
    const result = await loginWithGoogle(response.credential, captcha.captchaId, captchaAnswer.trim());

    if (result.success) {
      if (result.otpRequired) {
        setOtpRequired(true);
        setTempEmail(result.email);
        setIsSubmitting(false);
      } else if (!result.requiresRole) {
        const savedUser = localStorage.getItem("dps_session");
        if (savedUser) {
          const u = JSON.parse(savedUser);
          router.push(`/portal/${u.role.toLowerCase()}`);
        }
      }
    } else {
      setError(result.error || "Google authentication failed.");
      setIsSubmitting(false);
      fetchCaptcha();
      setCaptchaAnswer("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captcha) {
      setError("Please wait for captcha to load.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    const result = await login(email.trim(), password, captcha.captchaId, captchaAnswer.trim());

    if (result.success) {
      if (result.otpRequired) {
        setOtpRequired(true);
        setTempEmail(result.email || email.trim());
        setIsSubmitting(false);
      } else {
        const savedUser = localStorage.getItem("dps_session");
        if (savedUser) {
          const u = JSON.parse(savedUser);
          router.push(`/portal/${u.role.toLowerCase()}`);
        }
      }
    } else {
      setError(result.error || "Failed to authenticate");
      setIsSubmitting(false);
      fetchCaptcha();
      setCaptchaAnswer("");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await verifyOtp(tempEmail, otpCode.trim());

    if (result.success) {
      const savedUser = localStorage.getItem("dps_session");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        router.push(`/portal/${u.role.toLowerCase()}`);
      }
    } else {
      setError(result.error || "Invalid OTP code");
      setIsSubmitting(false);
    }
  };

  if (otpRequired) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative select-none animate-fadeIn">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0B7A3B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
          <div className="flex justify-center">
            <DPSLogo size={72} variant="dark" />
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold text-white tracking-tight">
            OTP Security Verification
          </h2>
          <p className="mt-1.5 text-center text-xs text-slate-400">
            Enter the 6-digit verification code generated for <strong>{tempEmail}</strong>.
          </p>
          <div className="mt-2 text-center text-[10px] text-emerald-400 font-semibold bg-emerald-950/20 border border-emerald-900/30 rounded py-1 px-4 max-w-sm mx-auto">
            🛠️ For testing, copy the OTP code printed in your backend server logs.
          </div>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
          <div className="bg-slate-800 py-8 px-6 sm:px-10 border border-slate-700 rounded-xl shadow-xl space-y-6">
            {error && (
              <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-lg flex items-start gap-2.5 text-red-300 text-xs leading-normal animate-shake">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-5 text-slate-300">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block text-center mb-1">Enter OTP Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-2xl font-bold border border-slate-700 bg-slate-900 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-emerald-400 tracking-[0.4em] font-mono"
                  placeholder="••••••"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpRequired(false);
                    setError("");
                    setOtpCode("");
                    setCaptchaAnswer("");
                    fetchCaptcha();
                  }}
                  className="w-1/2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold text-sm transition-colors text-center cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-primary hover:bg-emerald-700 text-white py-3 rounded-lg font-bold text-sm shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? "Verifying..." : "Verify & Log In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative select-none">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
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
              <label className="text-xs font-bold text-slate-400">Email Address or Full Name</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm border border-slate-700 bg-slate-900 rounded p-2.5 focus:ring focus:outline-none text-white"
                placeholder="e.g. student@dpsdamanjodi.edu.in or Rahul Mohanty"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400">Password</label>
                <a href="#" className="text-[10px] text-secondary hover:underline">Forgot password?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm border border-slate-700 bg-slate-900 rounded p-2.5 focus:ring focus:outline-none text-white animate-transition"
                placeholder="••••••••"
              />
            </div>

            {/* Captcha Box */}
            {captcha && (
              <div className="space-y-2 border border-slate-700/50 bg-slate-900/30 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Math Security Challenge</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCaptchaAnswer("");
                      fetchCaptcha();
                    }}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    Refresh
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded text-emerald-400 font-mono font-bold tracking-wider select-none text-sm min-w-[110px] text-center">
                    {captcha.question}
                  </div>
                  <input
                    type="text"
                    required
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="flex-1 text-sm border border-slate-700 bg-slate-900 rounded p-2 focus:ring focus:outline-none text-white"
                    placeholder="Enter answer"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-emerald-700 text-white py-3 rounded-md font-bold text-sm shadow transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <LogIn size={16} />
              {isSubmitting ? "Authenticating Session..." : "Secure Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-3 text-slate-400 text-[10px]">Or connect with</span>
            </div>
          </div>

          {/* Google Login Target Button Container */}
          <div className="flex justify-center w-full flex-col items-center gap-2">
            <div id="google-signin-btn"></div>
            {captchaAnswer ? (
              <span className="text-[10px] text-slate-400">Google callback will submit with math answer</span>
            ) : (
              <span className="text-[10px] text-red-400">Solve the math challenge to enable Google sign-in</span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

