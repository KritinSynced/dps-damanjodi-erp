"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DPSLogo from "@/components/ui/DPSLogo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SignIn } from "@clerk/nextjs";

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

    const mouse = {
      x: null,
      y: null,
    };

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

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

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

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

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

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in and synced
  useEffect(() => {
    if (user && !isLoading) {
      router.push(`/portal/${user.role.toLowerCase()}`);
    }
  }, [user, isLoading, router]);


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      <InteractiveParticles />

      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Website
        </Link>
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 flex justify-center">
        <SignIn
          path="/login"
          routing="path"
          appearance={{
            variables: {
              colorPrimary: "#0B7A3B", // Forest Green
              colorBackground: "#ffffff", // White
              colorText: "#1f2937", // Slate-800
              colorTextSecondary: "#4b5563", // Slate-600
              colorInputBackground: "#f9fafb", // Gray-50
              colorInputText: "#111827", // Gray-900
              colorBorder: "#e5e7eb", // Gray-200
            },
            elements: {
              card: "border border-slate-200/80 rounded-xl shadow-xl bg-white",
              headerIcon: "hidden",
              headerTitle: "text-slate-800 text-lg font-bold tracking-tight",
              headerSubtitle: "text-slate-500 text-xs",
              socialButtonsBlockButton: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200",
              formButtonPrimary: "bg-primary hover:bg-emerald-700 text-white font-bold transition-colors",
              footerActionLink: "text-primary hover:text-emerald-700 font-semibold",
              formFieldLabel: "text-slate-600 text-xs font-bold",
              formFieldInput: "bg-white border border-slate-200 text-slate-800 text-sm rounded focus:ring-1 focus:ring-primary focus:border-primary",
              dividerLine: "bg-slate-100",
              dividerText: "text-slate-400 text-[10px]"
            }
          }}
          signUpUrl="/register"
        />
      </div>
    </div>
  );
}


