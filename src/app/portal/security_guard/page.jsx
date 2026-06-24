"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, ClipboardList, CheckCircle, Clock, Sparkles, Loader2, AlertCircle, Plus, Search } from "lucide-react";

function SecurityDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [visitorLogs, setVisitorLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Visitor Form State
  const [visitorForm, setVisitorForm] = useState({
    visitorName: "",
    visitorPhone: "",
    purpose: "",
    vehicleNumber: ""
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchVisitorLogs();
  }, []);

  async function fetchVisitorLogs() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/security-guard");
      const data = await res.json();
      if (data.success) {
        setVisitorLogs(data.visitorLogs);
      } else {
        setError(data.error || "Failed to load visitor logs");
      }
    } catch (err) {
      setError("Network error loading dashboard data");
    } finally {
      setLoading(false);
    }
  }

  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/portal/security-guard/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visitorForm)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setVisitorForm({ visitorName: "", visitorPhone: "", purpose: "", vehicleNumber: "" });
        fetchVisitorLogs(); // refresh logs
      } else {
        alert(data.error || "Failed to save visitor log");
      }
    } catch (err) {
      alert("Error saving visitor log");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckOut = async (logId) => {
    try {
      const res = await fetch("/api/portal/security-guard/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId })
      });
      const data = await res.json();
      if (data.success) {
        alert("Visitor successfully checked out!");
        fetchVisitorLogs(); // refresh logs
      } else {
        alert(data.error || "Failed to checkout visitor");
      }
    } catch (err) {
      alert("Error checking out visitor");
    }
  };

  // Filter logs based on search query
  const filteredLogs = visitorLogs.filter(log => {
    const q = searchQuery.toLowerCase();
    return (
      log.visitorName.toLowerCase().includes(q) ||
      (log.vehicleNumber && log.vehicleNumber.toLowerCase().includes(q)) ||
      log.visitorPhone.includes(q)
    );
  });

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
        <button onClick={fetchVisitorLogs} className="mt-4 text-xs font-semibold text-primary underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-slate-700 dark:text-slate-200">
      
      {/* 1. DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-sky-900/30">
            <div className="relative z-10 max-w-xl space-y-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-sky-400 border border-primary/30 uppercase tracking-wider">
                <Sparkles size={10} /> Gate Security Desk
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {user.name}</h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                DPS Damanjodi Gate Security Log Portal. Register visitors entry, monitor active vehicles inside campus, and check visitors out.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <ClipboardList size={200} className="translate-x-12 translate-y-12 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Column 1: Log Visitor Form */}
            <div className="lg:col-span-5 bg-card border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                <Plus size={18} className="text-primary" /> Log New Visitor Entry
              </h3>
              
              {success && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-3.5 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                  Visitor check-in logged successfully!
                </div>
              )}

              <form onSubmit={handleVisitorSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Visitor Full Name</label>
                  <input
                    type="text"
                    required
                    value={visitorForm.visitorName}
                    onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background placeholder-slate-400"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Visitor Phone Number</label>
                  <input
                    type="text"
                    required
                    value={visitorForm.visitorPhone}
                    onChange={(e) => setVisitorForm({ ...visitorForm, visitorPhone: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background placeholder-slate-400"
                    placeholder="e.g. +91 99370 XXXXX"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Purpose of Visit</label>
                  <input
                    type="text"
                    required
                    value={visitorForm.purpose}
                    onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background placeholder-slate-400"
                    placeholder="e.g. Meeting principal, courier delivery"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Vehicle Number (Optional)</label>
                  <input
                    type="text"
                    value={visitorForm.vehicleNumber}
                    onChange={(e) => setVisitorForm({ ...visitorForm, vehicleNumber: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background placeholder-slate-400"
                    placeholder="e.g. OD-10-H-1234"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary hover:bg-primary-hover text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer w-full"
                >
                  {saving ? "Logging entry..." : "Log Gate Entry"}
                </button>
              </form>
            </div>

            {/* Column 2: Active Visitors List */}
            <div className="lg:col-span-7 bg-card border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Clock size={18} className="text-primary" /> Active Visitor Logs
                </h3>
                
                {/* Search Bar */}
                <div className="relative max-w-xs w-full">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name/vehicle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto border rounded-lg bg-card text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-2.5">Visitor</th>
                      <th className="p-2.5">Phone</th>
                      <th className="p-2.5">Purpose</th>
                      <th className="p-2.5">In Time</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-muted-foreground font-medium">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5">
                            <span className="font-bold text-slate-800 dark:text-white block">{log.visitorName}</span>
                            {log.vehicleNumber && (
                              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono block w-fit mt-0.5">{log.vehicleNumber}</span>
                            )}
                          </td>
                          <td className="p-2.5 font-mono">{log.visitorPhone}</td>
                          <td className="p-2.5 truncate max-w-[120px]">{log.purpose}</td>
                          <td className="p-2.5 text-[10px]">
                            {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-2.5 text-right">
                            {log.checkOutTime ? (
                              <span className="text-[9px] text-slate-400 italic">Checked Out</span>
                            ) : (
                              <button
                                onClick={() => handleCheckOut(log.id)}
                                className="bg-slate-900 hover:bg-slate-950 text-white text-[10px] px-2 py-0.5 rounded font-bold cursor-pointer"
                              >
                                Check Out
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center italic text-slate-400">No visitors logged.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function SecurityDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    }>
      <SecurityDashboardContent />
    </Suspense>
  );
}
