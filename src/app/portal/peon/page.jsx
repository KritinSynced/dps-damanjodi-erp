"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Calendar, ClipboardList, CheckCircle, Clock, Sparkles, Loader2, AlertCircle } from "lucide-react";

function PeonDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [duties, setDuties] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    fetchPeonData();
  }, []);

  async function fetchPeonData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/peon");
      const data = await res.json();
      if (data.success) {
        setDuties(data.duties);
        setAnnouncements(data.announcements);
      } else {
        setError(data.error || "Failed to load peon dashboard logs");
      }
    } catch (err) {
      setError("Network error loading dashboard data");
    } finally {
      setLoading(false);
    }
  }

  const handleMarkComplete = async (dutyId) => {
    try {
      const res = await fetch("/api/portal/peon/complete-duty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dutyId })
      });
      const data = await res.json();
      if (data.success) {
        alert("Duty marked as completed!");
        // Update local status
        setDuties(prev => prev.map(d => d.id === dutyId ? { ...d, status: "COMPLETED" } : d));
      } else {
        alert(data.error || "Failed to update duty");
      }
    } catch (err) {
      alert("Error processing completion request");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 text-center text-red-500">
        <AlertCircle className="mx-auto w-10 h-10 mb-2" />
        <p className="font-bold">{error}</p>
        <button onClick={fetchPeonData} className="mt-4 text-xs font-semibold text-primary underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-slate-700 dark:text-slate-200">
      
      {/* 1. DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-indigo-900/30">
            <div className="relative z-10 max-w-xl space-y-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-indigo-400 border border-primary/30 uppercase tracking-wider">
                <Sparkles size={10} /> Peon Workdesk
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {user.name}</h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                Delhi Public School Damanjodi Support Portal. Review your daily task logs, schedule, and school bulletins.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <ClipboardList size={200} className="translate-x-12 translate-y-12 text-white" />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border p-4 rounded-lg shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-primary/10 rounded-lg text-primary"><Clock size={20} /></div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Pending Tasks</span>
                <h4 className="font-extrabold text-lg leading-tight mt-0.5">{duties.filter(d => d.status === "PENDING").length}</h4>
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-primary/10 rounded-lg text-primary"><CheckCircle size={20} /></div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Completed Today</span>
                <h4 className="font-extrabold text-lg leading-tight mt-0.5">{duties.filter(d => d.status === "COMPLETED").length}</h4>
              </div>
            </div>
          </div>

          {/* Duties schedule panel */}
          <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <ClipboardList size={18} className="text-primary" />
              Duty Schedule & Classroom Logs
            </h3>
            
            <div className="space-y-3">
              {duties.length > 0 ? (
                duties.map((duty) => (
                  <div key={duty.id} className="border p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{duty.timeSlot}</span>
                        <span className="text-xs text-muted-foreground">{duty.location}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug">{duty.task}</h4>
                    </div>
                    <div className="flex gap-2 shrink-0 self-end sm:self-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded inline-block ${
                        duty.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30"
                          : "bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30"
                      }`}>
                        {duty.status}
                      </span>
                      {duty.status === "PENDING" && (
                        <button
                          onClick={() => handleMarkComplete(duty.id)}
                          className="bg-primary hover:bg-primary-hover text-white text-xs px-2.5 py-1 rounded font-bold cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No duties assigned for today.</p>
              )}
            </div>
          </div>

          {/* School Notice bulletins */}
          <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Active Notices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements && announcements.length > 0 ? (
                announcements.slice(0, 4).map((notice) => (
                  <div key={notice.id} className="border-l-4 border-primary pl-3 py-1 bg-slate-50/50 dark:bg-slate-900/10 p-2.5 rounded text-left">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      {new Date(notice.date).toLocaleDateString()} • {notice.category}
                    </span>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-tight">{notice.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{notice.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic col-span-2">No notices active.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PeonDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    }>
      <PeonDashboardContent />
    </Suspense>
  );
}
