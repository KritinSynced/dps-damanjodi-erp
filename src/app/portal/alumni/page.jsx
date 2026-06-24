"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Award, Calendar, Bell, ShieldAlert,
  AlertCircle, Sparkles, Loader2, ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function AlumniDashboardPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchAnnouncements() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/announcements");
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      } else {
        setError("Failed to load school announcements");
      }
    } catch (err) {
      setError("Network error loading announcements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      fetchAnnouncements();
    }, 0);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-slate-700 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg animate-fade-in">
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-emerald-400 border border-primary/30 uppercase tracking-wider">
            <Sparkles size={10} /> Alumni Network
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome Back, {user.name}</h1>
          <p className="text-slate-350 text-xs sm:text-sm font-medium leading-relaxed">
            Stay connected with Delhi Public School Damanjodi. Access live school announcements, success stories, and upcoming events.
          </p>
        </div>
        {/* Visual background accents */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Award size={200} className="translate-x-12 translate-y-12 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* School Announcements */}
        <div className="lg:col-span-8 bg-card border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b pb-3">
            <Bell size={18} className="text-primary animate-pulse" /> Live Notice Board
          </h3>
          
          <div className="space-y-4">
            {announcements.slice(0, 4).map((ann) => (
              <div key={ann.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0 flex items-start gap-4">
                <div className="bg-slate-50 border p-2 rounded text-center shrink-0 w-12 h-12 flex flex-col justify-center shadow-inner">
                  <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">
                    {new Date(ann.date).toLocaleString("default", { month: "short" })}
                  </span>
                  <span className="text-sm font-bold text-primary mt-0.5 leading-none">
                    {new Date(ann.date).getDate()}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      ann.category === "URGENT" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {ann.category}
                    </span>
                    <span className="text-[10px] text-slate-400">Target: {ann.targetRole}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 leading-tight">{ann.title}</h4>
                  <p className="text-xs text-muted-foreground leading-normal">{ann.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Sidebar - Upcoming Events & Spotlight */}
        <div className="lg:col-span-4 space-y-6">
          {/* Spotlight Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2.5">
              <Award className="text-primary" size={20} />
              <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wide">Alumni Spotlight</h4>
            </div>
            <p className="text-xs italic text-slate-650 leading-relaxed font-medium">
              &quot;DPS Damanjodi provided the foundational platform that inspired me to pursue engineering at IIT. The rigorous smart classes and smart lab curriculum were absolute game changers.&quot;
            </p>
            <div className="text-[10px] font-bold text-slate-800">— Priyanshu Mohanty, Class of 2022</div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={15} className="text-primary" /> Upcoming Events
            </h3>
            
            <div className="space-y-4 text-xs font-medium">
              <div className="border-l-2 border-primary pl-3.5 py-0.5 space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase">Aug 15, 2026</span>
                <h4 className="font-bold text-slate-800 text-xs">79th Independence Day</h4>
                <p className="text-[11px] text-slate-400">School Parade Ground • Flag Hoisting</p>
              </div>

              <div className="border-l-2 border-primary pl-3.5 py-0.5 space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase">Nov 20, 2026</span>
                <h4 className="font-bold text-slate-800 text-xs">UDGAM 2026 Annual Cultural Day</h4>
                <p className="text-[11px] text-slate-400">Main School Auditorium • Alumni Desk</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
