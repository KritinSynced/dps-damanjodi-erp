"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

function InteractiveParticles() {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 100;
    const attractionRadius = 180;
    const attractionForce = 0.04;

    const mouse = { x: null, y: null };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.baseRadius = Math.random() * 2 + 1.5;
        this.radius = this.baseRadius;
        const greens = ["#0B7A3B", "#10B981", "#059669", "#34D399"];
        this.color = greens[Math.floor(Math.random() * greens.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < attractionRadius) {
            this.x += (dx / distance) * (attractionRadius - distance) * attractionForce;
            this.y += (dy / distance) * (attractionRadius - distance) * attractionForce;
            this.radius = this.baseRadius * 1.4;
          } else {
            this.radius = this.baseRadius;
          }
        } else {
          this.radius = this.baseRadius;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
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

          if (distance < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(11, 122, 91, ${0.12 * (1 - distance / 110)})`;
            ctx.lineWidth = 0.5;
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

function SetPasswordContent() {
  const { saveSession } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const initTriggered = useRef(false);

  useEffect(() => {
    if (!email) {
      router.push("/sign-in");
      return;
    }

    if (initTriggered.current) return;
    initTriggered.current = true;

    const requestOtpCode = async () => {
      try {
        const res = await fetch("/api/auth/request-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          setSuccessMsg(`A verification code (OTP) has been sent to ${email}. Check your email.`);
        } else {
          setErrorMsg(data.error || "Failed to send verification code.");
        }
      } catch (err) {
        console.error("Failed to request OTP code:", err);
        setErrorMsg("Failed to send verification code. Please reload the page.");
      } finally {
        setIsInitializing(false);
      }
    };

    requestOtpCode();
  }, [email, router]);

  const handleResendOtp = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsInitializing(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`A new verification code (OTP) has been sent to ${email}.`);
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
      const res = await fetch("/api/auth/complete-first-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        saveSession(data.user, data.token);
        setSuccessMsg("Password set successfully! Redirecting to dashboard...");
        
        setTimeout(() => {
          const role = data.user.role;
          if (role === "ADMIN") router.push("/portal/admin");
          else if (role === "TEACHER") router.push("/portal/teacher");
          else if (role === "STUDENT") router.push("/portal/student");
          else router.push(`/portal/${role.toLowerCase()}`);
        }, 1500);
      } else {
        setErrorMsg(data.error || "Failed to verify code and set password.");
      }
    } catch (err) {
      console.error("Setup password failed:", err);
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      <InteractiveParticles />

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
            <h2 className="text-slate-800 text-lg font-bold tracking-tight">Set Account Password</h2>
            <p className="text-slate-500 text-xs mt-1">
              Verify your email and define your security credentials to access the workspace
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
                  <label className="text-slate-600 text-xs font-bold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 text-sm p-2.5 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 text-xs font-bold flex justify-between items-center">
                    <span>Enter Verification Code (OTP)</span>
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
                  <label className="text-slate-600 text-xs font-bold">
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
                  <label className="text-slate-600 text-xs font-bold">
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
                      Setting Password...
                    </>
                  ) : (
                    "Verify & Set Password"
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

export default function SetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-primary w-8 h-8" />
          <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preparing Password Setup...</p>
        </div>
      }
    >
      <SetPasswordContent />
    </React.Suspense>
  );
}