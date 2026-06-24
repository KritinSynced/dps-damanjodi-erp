"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, BookOpen, Bell, ShieldAlert,
  AlertCircle, Activity, Library, Sparkles
} from "lucide-react";

function PrincipalDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [portalData, setPortalData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [archivedAnnouncements, setArchivedAnnouncements] = useState([]);
  const [announcementsTab, setAnnouncementsTab] = useState("active"); // "active" or "archived"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      // Principal fetches all general data (metrics + teachers)
      const resData = await fetch("/api/portal/admin");
      const data = await resData.json();

      const resAnn = await fetch("/api/portal/announcements");
      const annData = await resAnn.json();

      if (data.success && annData.success) {
        setPortalData(data);
        setAnnouncements(annData.announcements || []);
        setArchivedAnnouncements(annData.archivedAnnouncements || []);
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (err) {
      setError("Network error loading dashboard data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="flex-1 p-8 text-center text-red-500">
        <AlertCircle className="mx-auto w-10 h-10 mb-2" />
        <p className="font-bold">{error || "Failed to load principal profile"}</p>
        <button onClick={fetchData} className="mt-4 text-xs font-semibold text-primary underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-slate-700">
      
      {/* 1. PRINCIPAL DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10 max-w-xl space-y-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-emerald-400 border border-primary/30 uppercase tracking-wider">
                <Sparkles size={10} /> Principal Desk
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {user.name}</h1>
              <p className="text-slate-350 text-xs sm:text-sm font-medium leading-relaxed">
                Delhi Public School Damanjodi executive administrative dashboard. Oversee school operations, faculties, and broadcasts.
              </p>
            </div>
            {/* Visual background accents */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Users size={200} className="translate-x-12 translate-y-12 text-white" />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border p-4 rounded-lg shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-primary/10 rounded-lg text-primary"><Users size={20} /></div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Total Students</span>
                <h4 className="font-extrabold text-lg leading-tight mt-0.5">{portalData.metrics.studentCount}</h4>
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-primary/10 rounded-lg text-primary"><Users size={20} /></div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Educators Registry</span>
                <h4 className="font-extrabold text-lg leading-tight mt-0.5">{portalData.metrics.teacherCount}</h4>
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-primary/10 rounded-lg text-primary"><Library size={20} /></div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Library Books</span>
                <h4 className="font-extrabold text-lg leading-tight mt-0.5">{portalData.metrics.bookCount}</h4>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Announcements Panel */}
            <div className="lg:col-span-8 bg-card border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Bell size={18} className="text-primary animate-pulse" /> Live Notice Board
              </h3>
              
              <div className="space-y-3.5">
                {announcements.slice(0, 5).map((ann) => (
                  <div key={ann.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0 flex items-start gap-4">
                    <div className="bg-slate-50 border p-2 rounded text-center shrink-0 w-12 h-12 flex flex-col justify-center">
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
                      <p className="text-xs text-muted-foreground leading-normal line-clamp-2">{ann.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail */}
            <div className="lg:col-span-4 bg-card border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Activity size={16} className="text-primary" /> School Activity Log
              </h3>
              <div className="space-y-3 text-[11px] text-muted-foreground">
                {portalData.auditLogs.map((log) => (
                  <div key={log.id} className="border-b pb-2.5 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-700">{log.action}</span>
                      <span className="text-[9px] text-slate-400 shrink-0">{log.time}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">By: {log.user}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TEACHERS REGISTRY TAB */}
      {activeTab === "teachers" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col gap-1 border-b pb-4">
            <h2 className="text-lg font-bold text-slate-800">Homeroom Teachers Registry</h2>
            <p className="text-xs text-muted-foreground">Registered educators and department configurations.</p>
          </div>

          <div className="overflow-x-auto border rounded-lg bg-card text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Emp ID</th>
                  <th className="p-3">Educator Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Qualifications</th>
                  <th className="p-3">Homeroom Block</th>
                </tr>
              </thead>
              <tbody className="divide-y text-muted-foreground font-medium">
                {portalData.teachers.map((teach) => (
                  <tr key={teach.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800">{teach.employeeId}</td>
                    <td className="p-3 font-bold text-slate-800">{teach.user.name}</td>
                    <td className="p-3 font-mono">{teach.user.email}</td>
                    <td className="p-3 text-primary font-bold">{teach.department}</td>
                    <td className="p-3">{teach.qualification}</td>
                    <td className="p-3">
                      <span className="text-slate-400 italic">N/A</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ANNOUNCEMENTS TAB */}
      {activeTab === "announcements" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">All Broadcast Announcements</h2>
              <p className="text-xs text-muted-foreground">Historical ledger of all broadcast announcements and targets.</p>
            </div>

            {/* Tab Selector */}
            <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAnnouncementsTab("active")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  announcementsTab === "active"
                    ? "bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                }`}
              >
                Active ({announcements.length})
              </button>
              <button
                type="button"
                onClick={() => setAnnouncementsTab("archived")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  announcementsTab === "archived"
                    ? "bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                }`}
              >
                Archive Folder ({archivedAnnouncements.length})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {(announcementsTab === "active" ? announcements : archivedAnnouncements).length > 0 ? (
              (announcementsTab === "active" ? announcements : archivedAnnouncements).map((ann) => (
                <div key={ann.id} className="bg-slate-50/50 border rounded-xl p-5 flex gap-4 transition-all hover:border-primary/20">
                  <div className="bg-white border rounded text-center shrink-0 w-14 h-14 flex flex-col justify-center shadow-sm">
                    <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">
                      {new Date(ann.date).toLocaleString("default", { month: "short" })}
                    </span>
                    <span className="text-lg font-extrabold text-primary mt-0.5 leading-none">
                      {new Date(ann.date).getDate()}
                    </span>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        ann.category === "URGENT" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}>
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-slate-450 font-bold">Target Audience: {ann.targetRole}</span>
                      {ann.endDate && (
                        <span className="text-[9px] border dark:border-slate-800 rounded px-1 text-slate-500 dark:text-slate-400 font-medium">
                          {announcementsTab === "active" ? "Expires: " : "Expired: "}
                          {new Date(ann.endDate).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-800 leading-snug">{ann.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{ann.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                {announcementsTab === "active" ? "No notices currently active." : "Archive folder is empty."}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function PrincipalDashboardPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PrincipalDashboardContent />
    </React.Suspense>
  );
}
