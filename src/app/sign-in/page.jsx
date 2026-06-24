"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function GreenParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 75;
    const attractionRadius = 150;
    const attractionForce = 0.03;

    const mouse = { x: null, y: null };

    // Bright green & lime palette for light background
    const palette = [
      "#16a34a", "#15803d", "#22c55e", "#4ade80",
      "#86efac", "#84cc16", "#65a30d", "#a3e635",
    ];

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.baseRadius = Math.random() * 2.5 + 1;
        this.radius = this.baseRadius;
        this.color = palette[Math.floor(Math.random() * palette.length)];
        this.opacity = Math.random() * 0.5 + 0.3;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.age = Math.random() * 1000;
      }

      update() {
        this.age += 1;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < attractionRadius) {
            const force = (attractionRadius - distance) * attractionForce;
            this.x += (dx / distance) * force;
            this.y += (dy / distance) * force;
            this.radius = this.baseRadius * 2;
          } else {
            this.radius = this.baseRadius;
          }
        } else {
          this.radius = this.baseRadius;
        }
        const pulse = Math.sin(this.age * this.pulseSpeed + this.pulseOffset) * 0.4 + 1;
        this.displayRadius = this.radius * pulse;
      }

      draw() {
        // Glow halo
        const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.displayRadius * 3);
        grd.addColorStop(0, this.color + "cc");
        grd.addColorStop(1, this.color + "00");
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.displayRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.globalAlpha = this.opacity * 0.4;
        ctx.fill();
        // Core dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.displayRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleMouseLeave = () => { mouse.x = null; mouse.y = null; };
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.15 * (1 - distance / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ display: "block" }}
    />
  );
}


export default function SignInPage() {
  const { saveSession, user } = useAuth();
  const router = useRouter();

  // Auth 3-Step Flow State
  const [step, setStep] = useState(1); // 1 = Email, 2 = Password, 3 = OTP
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Change Password Mode State
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [cpStep, setCpStep] = useState("form"); // "form" | "otp"
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [cpOtp, setCpOtp] = useState(["", "", "", "", "", ""]);
  const [cpSuccess, setCpSuccess] = useState(false);
  const cpOtpRefs = useRef([]);

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Countdown (10 mins = 600 seconds)
  const [timer, setTimer] = useState(600);
  const [canResend, setCanResend] = useState(false);

  // References for OTP fields
  const otpInputsRef = useRef([]);

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      router.push(`/portal/${user.role.toLowerCase()}`);
    }
  }, [user, router]);

  // Handle OTP countdown timer
  useEffect(() => {
    if (step !== 3 || timer <= 0) {
      if (timer === 0) setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  // Format timer into MM:SS
  const formatTimer = () => {
    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Step 1: Verify Email Registry
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMaskedEmail(data.maskedEmail);
        setStep(2);
      } else {
        setError(data.error || "Email address is not registered.");
      }
    } catch (err) {
      setError("Network connectivity error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Validate Password & Trigger OTP
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep(3);
        setTimer(600); // 10 mins countdown
        setCanResend(false);
      } else {
        setError(data.error || "Invalid password credential.");
      }
    } catch (err) {
      setError("Network connectivity error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Verify OTP Code
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please fill out all 6 digits of the OTP code.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otpCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        saveSession(data.user, data.token);
        router.push(`/portal/${data.user.role.toLowerCase()}`);
      } else {
        setError(data.error || "Invalid verification code.");
      }
    } catch (err) {
      setError("Network connectivity error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP trigger
  const handleResendOtp = async () => {
    setError("");
    setTimer(600);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to resend code.");
      }
    } catch (err) {
      setError("Network connectivity error.");
    }
  };

  // Handle OTP Inputs keypress logic
  const handleOtpChange = (value, index) => {
    if (isNaN(Number(value))) return; // Digits only
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpInputsRef.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    if (text.length !== 6 || isNaN(Number(text))) return;
    
    const textDigits = text.split("");
    setOtp(textDigits);
    otpInputsRef.current[5].focus();
  };

  // Trigger login verification directly when the last OTP block is filled
  useEffect(() => {
    if (otp.join("").length === 6 && step === 3) {
      handleVerifyOtp();
    }
  }, [otp]);

  // Change Password Handlers
  const handleRequestPasswordChange = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/request-password-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChangePasswordMode(true);
        setNewPassword("");
        setConfirmPassword("");
        setCpOtp(["", "", "", "", "", ""]);
        setSuccessMessage("Verification code has been sent to your email.");
      } else {
        setError(data.error || "Failed to send verification code.");
      }
    } catch (err) {
      setError("Network connectivity error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const otpCode = cpOtp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          newPassword,
          otp: otpCode,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChangePasswordMode(false);
        setSuccessMessage("Password changed successfully! You can now log in with your new password.");
        setPassword(""); // clear password input field
      } else {
        setError(data.error || "Failed to change password. Please check the OTP.");
      }
    } catch (err) {
      setError("Network connectivity error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCpOtpChange = (value, index) => {
    if (isNaN(Number(value))) return;
    
    const newCpOtp = [...cpOtp];
    newCpOtp[index] = value.substring(value.length - 1);
    setCpOtp(newCpOtp);

    if (value && index < 5) {
      cpOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleCpOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!cpOtp[index] && index > 0) {
        const newCpOtp = [...cpOtp];
        newCpOtp[index - 1] = "";
        setCpOtp(newCpOtp);
        cpOtpRefs.current[index - 1]?.focus();
      } else {
        const newCpOtp = [...cpOtp];
        newCpOtp[index] = "";
        setCpOtp(newCpOtp);
      }
    }
  };

  const handleCpOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    if (text.length !== 6 || isNaN(Number(text))) return;
    
    const textDigits = text.split("");
    setCpOtp(textDigits);
    cpOtpRefs.current[5]?.focus();
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(ellipse at 15% 40%, rgba(187,247,208,0.7) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(163,230,53,0.25) 0%, transparent 50%), radial-gradient(ellipse at 60% 90%, rgba(74,222,128,0.3) 0%, transparent 55%), #f0fdf4",
      }}
    >
      <GreenParticles />

      {/* Ambient light orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(134,239,172,0.5) 0%, transparent 70%)", filter: "blur(50px)" }} />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(163,230,53,0.35) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.2) 0%, transparent 70%)", filter: "blur(40px)" }} />

      {/* Floating Back CTA */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Website
        </Link>
      </div>

      {/* Logo Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center mb-4 px-4">
        <div className="flex justify-center">
          <div className="rounded-xl overflow-hidden shadow-lg" style={{ border: "1px solid rgba(34,197,94,0.3)", boxShadow: "0 8px 30px rgba(34,197,94,0.15), 0 2px 8px rgba(0,0,0,0.08)" }}>
            <img
              src="/logo-banner.png"
              alt="Delhi Public School Damanjodi Logo"
              className="w-full max-w-[320px] h-auto object-contain bg-white p-1"
            />
          </div>
        </div>
      </div>

      {/* Login Module */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div
          className="relative rounded-2xl p-6 sm:p-8 flex flex-col gap-5 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(34,197,94,0.3)",
            boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 20px 50px rgba(34,197,94,0.12), 0 0 0 1px rgba(255,255,255,0.9) inset",
          }}
        >
          {/* Green top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-lime-400 to-green-500 rounded-t-2xl" />
          {/* Subtle corner decoration */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(134,239,172,0.4) 0%, transparent 70%)" }} />

          {/* Progress Indicator */}
          {/* Step indicator */}
          <div className="flex items-center px-1">
            {[["Email", 1], ["Password", 2], ["OTP", 3]].map(([label, n], i) => (
              <React.Fragment key={n}>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    step >= n ? "bg-green-500 shadow-[0_0_6px_2px_rgba(34,197,94,0.5)]" : "bg-gray-200"
                  }`} />
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                    step >= n ? "text-green-600" : "text-gray-400"
                  }`}>{label}</span>
                </div>
                {i < 2 && (
                  <div className={`h-px flex-1 mx-2 transition-all duration-500 ${
                    step > n ? "bg-green-400" : "bg-gray-200"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div>
            <h2 className="text-gray-800 text-lg font-extrabold tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-green-500" size={20} />
              DPS ERP Login Workspace
            </h2>
            <p className="text-gray-400 text-xs mt-1">
              Admin-provisioned secure verification portal.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-red-600 font-semibold shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-green-700 font-semibold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Animation wrapper for steps */}
          <AnimatePresence mode="wait">
            
            {/* STEP 1: EMAIL VERIFICATION */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleVerifyEmail}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-600 text-xs font-bold flex items-center gap-1.5">
                    <Mail size={13} className="text-green-500" />
                    Registered School Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@dpsdamanjodi.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-gray-800 text-sm p-3 rounded-lg focus:outline-none transition-all placeholder-gray-300"
                    style={{ background: "rgba(240,253,244,0.8)", border: "1.5px solid #bbf7d0" }}
                    onFocus={(e) => { e.target.style.border = "1.5px solid #22c55e"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.12)"; }}
                    onBlur={(e) => { e.target.style.border = "1.5px solid #bbf7d0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer mt-1 transition-all"
                  style={{ background: "linear-gradient(135deg, #15803d, #16a34a, #22c55e)", boxShadow: "0 4px 20px rgba(34,197,94,0.35)" }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin w-4 h-4" /> Checking Registry...</>
                  ) : "Continue →"}
                </button>
              </motion.form>
            )}

            {/* STEP 2: PASSWORD VERIFICATION OR CHANGE PASSWORD */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="w-full"
              >
                {!changePasswordMode ? (
                  <form onSubmit={handleVerifyPassword} className="flex flex-col gap-4">
                    {/* Back Link */}
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-left text-[11px] font-bold text-green-600 hover:text-green-800 hover:underline inline-flex items-center gap-1 self-start transition-colors cursor-pointer"
                    >
                      ← Use different email
                    </button>

                    <div className="p-3 rounded-lg text-xs" style={{ background: "rgba(240,253,244,0.8)", border: "1px solid #bbf7d0" }}>
                      <span className="font-semibold block text-[10px] uppercase text-green-500 mb-0.5">Authorized email</span>
                      <span className="font-mono text-gray-700">{maskedEmail}</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-gray-600 text-xs font-bold flex items-center gap-1.5">
                          <Lock size={13} className="text-green-500" />
                          Enter Password (username@DDMMYYYY)
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full text-gray-800 text-sm p-3 pr-10 rounded-lg focus:outline-none transition-all placeholder-gray-300"
                          style={{ background: "rgba(240,253,244,0.8)", border: "1.5px solid #bbf7d0" }}
                          onFocus={(e) => { e.target.style.border = "1.5px solid #22c55e"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.12)"; }}
                          onBlur={(e) => { e.target.style.border = "1.5px solid #bbf7d0"; e.target.style.boxShadow = "none"; }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="text-right mt-1">
                        <button
                          type="button"
                          onClick={handleRequestPasswordChange}
                          className="text-[11px] font-bold text-green-600 hover:text-green-800 hover:underline transition-colors cursor-pointer"
                        >
                          Forgot or Change password?
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer mt-1 transition-all"
                      style={{ background: "linear-gradient(135deg, #15803d, #16a34a, #22c55e)", boxShadow: "0 4px 20px rgba(34,197,94,0.35)" }}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="animate-spin w-4 h-4" /> Verifying Credentials...</>
                      ) : "Verify Password →"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleChangePasswordSubmit} className="flex flex-col gap-4">
                    {/* Back Link */}
                    <button
                      type="button"
                      onClick={() => {
                        setChangePasswordMode(false);
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="text-left text-[11px] font-bold text-green-600 hover:text-green-800 hover:underline inline-flex items-center gap-1 self-start transition-colors cursor-pointer"
                    >
                      ← Back to Password Login
                    </button>

                    <div className="p-3 rounded-lg text-xs" style={{ background: "rgba(240,253,244,0.8)", border: "1px solid #bbf7d0" }}>
                      <span className="font-semibold block text-[10px] uppercase text-green-500 mb-0.5">Changing password for</span>
                      <span className="font-mono text-gray-700">{email}</span>
                    </div>

                    {/* New Password input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-600 text-xs font-bold flex items-center gap-1.5">
                        <Lock size={13} className="text-green-500" />
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPwd ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full text-gray-800 text-sm p-3 pr-10 rounded-lg focus:outline-none transition-all placeholder-gray-300"
                          style={{ background: "rgba(240,253,244,0.8)", border: "1.5px solid #bbf7d0" }}
                          onFocus={(e) => { e.target.style.border = "1.5px solid #22c55e"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.12)"; }}
                          onBlur={(e) => { e.target.style.border = "1.5px solid #bbf7d0"; e.target.style.boxShadow = "none"; }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPwd(!showNewPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors cursor-pointer"
                        >
                          {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-600 text-xs font-bold flex items-center gap-1.5">
                        <Lock size={13} className="text-green-500" />
                        Confirm New Password
                      </label>
                      <input
                        type={showNewPwd ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full text-gray-800 text-sm p-3 rounded-lg focus:outline-none transition-all placeholder-gray-300"
                        style={{ background: "rgba(240,253,244,0.8)", border: "1.5px solid #bbf7d0" }}
                        onFocus={(e) => { e.target.style.border = "1.5px solid #22c55e"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.12)"; }}
                        onBlur={(e) => { e.target.style.border = "1.5px solid #bbf7d0"; e.target.style.boxShadow = "none"; }}
                      />
                    </div>

                    {/* OTP digits block */}
                    <div className="flex flex-col gap-2">
                      <label className="text-gray-600 text-xs font-bold flex items-center gap-1.5">
                        <KeyRound size={13} className="text-green-500" />
                        Enter Verification Code sent to email
                      </label>
                      <div className="grid grid-cols-6 gap-2 sm:gap-3 py-2" onPaste={handleCpOtpPaste}>
                        {cpOtp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (cpOtpRefs.current[idx] = el)}
                            type="text"
                            maxLength={1}
                            required
                            value={digit}
                            onChange={(e) => handleCpOtpChange(e.target.value, idx)}
                            onKeyDown={(e) => handleCpOtpKeyDown(e, idx)}
                            className="w-full text-gray-800 font-extrabold text-lg rounded-lg h-12 text-center focus:outline-none transition-all"
                            style={{
                              background: digit ? "rgba(240,253,244,0.95)" : "rgba(255,255,255,0.8)",
                              border: digit ? "1.5px solid #22c55e" : "1.5px solid #bbf7d0",
                              boxShadow: digit ? "0 0 8px rgba(34,197,94,0.2)" : "none",
                            }}
                            onFocus={(e) => { e.target.style.border = "1.5px solid #16a34a"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.15)"; }}
                            onBlur={(e) => { e.target.style.border = digit ? "1.5px solid #22c55e" : "1.5px solid #bbf7d0"; e.target.style.boxShadow = digit ? "0 0 8px rgba(34,197,94,0.2)" : "none"; }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs mt-1">
                      <button
                        type="button"
                        onClick={handleRequestPasswordChange}
                        className="text-green-600 hover:text-green-800 hover:underline font-bold transition-colors cursor-pointer"
                        disabled={isSubmitting}
                      >
                        Resend Code
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer mt-1 transition-all"
                      style={{ background: "linear-gradient(135deg, #15803d, #16a34a, #22c55e)", boxShadow: "0 4px 20px rgba(34,197,94,0.35)" }}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="animate-spin w-4 h-4" /> Changing Password...</>
                      ) : "Change Password"}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* STEP 3: OTP VERIFICATION */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleVerifyOtp}
                className="flex flex-col gap-4"
              >
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-left text-[11px] font-bold text-green-600 hover:text-green-800 hover:underline inline-flex items-center gap-1 self-start transition-colors"
                >
                  ← Return to password
                </button>

                <div className="p-3 rounded-lg text-xs" style={{ background: "rgba(240,253,244,0.8)", border: "1px solid #bbf7d0" }}>
                  <span className="font-semibold block text-[10px] uppercase text-green-500 mb-0.5">OTP code sent to</span>
                  <span className="font-mono text-gray-700">{email}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-gray-600 text-xs font-bold flex items-center gap-1.5">
                    <KeyRound size={13} className="text-green-500" />
                    Enter 6-Digit Verification Code
                  </label>

                  {/* OTP Digits Grid */}
                  <div className="grid grid-cols-6 gap-2 sm:gap-3 py-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        required
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className="w-full text-gray-800 font-extrabold text-lg rounded-lg h-12 text-center focus:outline-none transition-all"
                        style={{
                          background: digit ? "rgba(240,253,244,0.95)" : "rgba(255,255,255,0.8)",
                          border: digit ? "1.5px solid #22c55e" : "1.5px solid #bbf7d0",
                          boxShadow: digit ? "0 0 8px rgba(34,197,94,0.2)" : "none",
                        }}
                        onFocus={(e) => { e.target.style.border = "1.5px solid #16a34a"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.15)"; }}
                        onBlur={(e) => { e.target.style.border = digit ? "1.5px solid #22c55e" : "1.5px solid #bbf7d0"; e.target.style.boxShadow = digit ? "0 0 8px rgba(34,197,94,0.2)" : "none"; }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-gray-500">
                    Expires in: <span className="font-mono text-green-600 font-bold">{formatTimer()}</span>
                  </span>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-green-400 hover:text-green-300 hover:underline font-bold transition-colors"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span className="text-slate-700 cursor-not-allowed">Resend Code</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 cursor-pointer mt-1 transition-all"
                  style={{ background: "linear-gradient(135deg, #84cc16, #22c55e, #16a34a)", color: "#052e16", boxShadow: "0 4px 20px rgba(132,204,22,0.35)" }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin w-4 h-4" /> Authorizing Access...</>
                  ) : "✓ Complete Verification"}
                </button>
              </motion.form>
            )}

          </AnimatePresence>

          {/* Bottom shimmer */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}
