"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  User, ClipboardList, CreditCard, MessageSquare, 
  Bus, FileText, CheckCircle, Download, Send, 
  Phone, UserCheck, AlertCircle, Compass, Clock, Play
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

function ParentDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [parentData, setParentData] = useState<any | null>(null);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Chat Simulation State
  const [messages, setMessages] = useState<any[]>([
    { id: 1, sender: "TEACHER", text: "Dear Parent, Rahul has been doing excellent in Mathematics but needs to focus more on drawing practical physics graphs.", date: "02-June-2026 11:20 AM" },
    { id: 2, sender: "PARENT", text: "Thank you for the update Sunita ji. I will sit with him tonight and verify his physics experiments folder.", date: "02-June-2026 04:30 PM" },
    { id: 3, sender: "TEACHER", text: "Great. Also, please ensure he attends the special math guidance session this Friday.", date: "03-June-2026 09:10 AM" }
  ]);
  const [newMsg, setNewMsg] = useState("");

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState<any | null>(null);
  const [payMethod, setPayMethod] = useState<"UPI" | "CARD" | "NET_BANKING">("UPI");
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);

  // Transport Bus Animation state
  const [busPosition, setBusPosition] = useState(0);
  const [isTrackingBus, setIsTrackingBus] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (user?.parentId) {
      fetchParentData();
    }
  }, [user]);

  // Simulate Bus GPS updates
  useEffect(() => {
    let interval: any;
    if (isTrackingBus && activeTab === "transport") {
      interval = setInterval(() => {
        setBusPosition((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isTrackingBus, activeTab]);

  const fetchParentData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/parent?parentId=${user?.parentId}`);
      const data = await res.json();
      if (data.success) {
        setParentData(data.parent);
        setAnnouncements(data.announcements);
        
        // Mock leave history for student
        const dummyLeaves = [
          { id: 1, startDate: new Date(Date.now() + 172800000), endDate: new Date(Date.now() + 345600000), reason: "Sister's marriage in Bhubaneswar", status: "APPROVED", appliedDate: new Date() }
        ];
        setLeaveHistory(dummyLeaves);
      } else {
        setError(data.error || "Failed to load parent dashboard data");
      }
    } catch (err) {
      setError("Network error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handlePayFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal) return;
    setIsProcessingPay(true);

    try {
      const res = await fetch("/api/portal/pay-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: paymentModal.id, method: payMethod }),
      });
      const data = await res.json();
      if (data.success) {
        if (parentData) {
          const updatedStudents = [...parentData.students];
          const activeChild = updatedStudents[selectedChildIndex];
          activeChild.feePayments = activeChild.feePayments.map((f: any) => 
            f.id === paymentModal.id ? data.payment : f
          );
          setParentData({ ...parentData, students: updatedStudents });
        }
        setPaymentModal(null);
        alert("Fee payment processed successfully! Downloadable receipt issued.");
      } else {
        alert(data.error || "Payment failed");
      }
    } catch (err) {
      alert("Error processing payment");
    } finally {
      setIsProcessingPay(false);
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSubmitting(true);
    setLeaveSuccess(false);

    const activeChild = parentData.students[selectedChildIndex];
    try {
      const res = await fetch("/api/portal/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeChild.userId,
          role: "STUDENT",
          ...leaveForm
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLeaveSuccess(true);
        setLeaveForm({ startDate: "", endDate: "", reason: "" });
        setLeaveHistory([
          {
            id: data.leaveRequest.id,
            startDate: new Date(data.leaveRequest.startDate),
            endDate: new Date(data.leaveRequest.endDate),
            reason: data.leaveRequest.reason,
            status: data.leaveRequest.status,
            appliedDate: new Date()
          },
          ...leaveHistory
        ]);
      } else {
        alert(data.error || "Failed to submit leave request");
      }
    } catch (err) {
      alert("Error submitting leave request");
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const timeString = new Date().toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const userMsg = {
      id: messages.length + 1,
      sender: "PARENT",
      text: newMsg.trim(),
      date: `Today ${timeString}`
    };

    setMessages([...messages, userMsg]);
    setNewMsg("");

    // Simulate teacher response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "TEACHER",
          text: "Thank you. Received your message. I will check his test logs and respond in detail.",
          date: `Today ${timeString}`
        }
      ]);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !parentData || parentData.students.length === 0) {
    return (
      <div className="flex-1 p-8 text-center text-red-500">
        <AlertCircle className="mx-auto w-10 h-10 mb-2" />
        <p className="font-bold">{error || "Failed to initialize parent profile"}</p>
        <button onClick={fetchParentData} className="mt-4 text-xs font-semibold text-primary underline">Retry</button>
      </div>
    );
  }

  const activeChild = parentData.students[selectedChildIndex];
  
  // Calculate Attendance Stats for Child
  const totalDays = activeChild.attendance.length;
  const presentDays = activeChild.attendance.filter((a: any) => a.status === "PRESENT" || a.status === "LATE").length;
  const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0.0";

  // Grades Recharts formatting
  const childGrades = activeChild.grades
    .filter((g: any) => g.examType === "MID_TERM")
    .map((g: any) => ({
      subject: g.subject.substring(0, 7),
      marks: g.theoryMarks,
      max: g.maxMarks,
      percentage: ((g.theoryMarks / g.maxMarks) * 100).toFixed(1)
    }));

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Selector Strip for Parents with multiple children */}
      <div className="bg-card border p-4 rounded-xl shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <UserCheck size={20} className="text-primary shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Select Child Profile</span>
            <div className="flex gap-2 mt-1">
              {parentData.students.map((child: any, idx: number) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildIndex(idx)}
                  className={`px-3 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                    selectedChildIndex === idx
                      ? "bg-primary text-white border-primary"
                      : "bg-background text-muted-foreground hover:bg-muted border-muted"
                  }`}
                >
                  {child.user.name} ({child.class}-{child.section})
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground font-semibold">
          Parent: {parentData.user.name} • {parentData.occupation}
        </div>
      </div>

      {/* CONDITIONAL PORTAL CONTENT */}

      {/* 1. DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          {/* Welcome heading */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Parent Dashboard</h1>
            <p className="text-xs text-muted-foreground">Monitoring academic activities of {activeChild.user.name}.</p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Attendance</span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-primary">{attendanceRate}%</span>
                <span className="text-[10px] text-muted-foreground">({presentDays}/{totalDays} Days)</span>
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Outstanding Fees</span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-red-600">
                  ₹ {activeChild.feePayments.filter((f: any) => f.status === "UNPAID").reduce((sum: number, f: any) => sum + f.amount, 0)}
                </span>
                <span className="text-[10px] text-muted-foreground">(Q4 Tuition)</span>
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Reports & GPA</span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-200">8.8 GPA</span>
                <span className="text-[10px] text-muted-foreground">(Class 10 Mid-Term)</span>
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Bus Tracking Status</span>
              <div className="flex items-baseline gap-1 mt-1.5 text-emerald-600 font-extrabold text-sm sm:text-base">
                <Bus size={18} className="animate-bounce" /> Active (On Route)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Notices and PTM reminder */}
            <div className="lg:col-span-8 space-y-6">
              {/* Mid-term marks chart */}
              <div className="bg-card border rounded-lg p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{activeChild.user.name}&apos;s Term Performance (%)</h3>
                <div className="h-64 w-full text-xs">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={childGrades} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="subject" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="percentage" fill="#0B7A3B" radius={[4, 4, 0, 0]} name="Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* School Notices */}
              <div className="bg-card border rounded-lg p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">School Notices</h3>
                <div className="space-y-3">
                  {announcements.slice(0, 3).map((notice) => (
                    <div key={notice.id} className="border-l-4 border-primary pl-4 py-1 space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {new Date(notice.date).toLocaleDateString()} • {notice.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{notice.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{notice.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick action panel / PTM updates */}
            <div className="lg:col-span-4 space-y-6">
              {/* PTM Details Card */}
              <div className="bg-gradient-to-br from-primary/10 to-slate-900/5 dark:from-slate-900 dark:to-slate-950 border border-primary/20 rounded-xl p-5 shadow-sm space-y-4 text-center">
                <Clock className="w-10 h-10 text-primary mx-auto" />
                <div>
                  <h3 className="font-bold text-base">Next Parent-Teacher Meet</h3>
                  <span className="text-xs text-secondary font-bold uppercase tracking-widest mt-1 block">Scheduled Meet</span>
                </div>
                <div className="bg-card border rounded-lg p-4 text-xs space-y-2 text-muted-foreground text-left shadow-sm">
                  <div><strong>Date:</strong> Saturday, June 14, 2026</div>
                  <div><strong>Time:</strong> 09:30 AM onwards</div>
                  <div><strong>Room:</strong> Secondary Wing Class block 10-A</div>
                  <div><strong>Teacher:</strong> Sunita Sharma (Mathematics)</div>
                </div>
                <button
                  onClick={() => alert("PTM slot locked. Message confirmation sent.")}
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white py-2 rounded-md font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer no-print"
                >
                  Confirm Attendance Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROGRESS TAB */}
      {activeTab === "progress" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in print-card">
          <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold">{activeChild.user.name}&apos;s Progress Report</h2>
              <p className="text-xs text-muted-foreground">CBSE Grade progression checklist.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-primary hover:bg-primary-hover text-white text-xs px-3 py-2 rounded font-bold transition-all flex items-center gap-1 cursor-pointer no-print"
            >
              <Download size={14} /> Download Child Report Card
            </button>
          </div>

          <div className="space-y-6">
            {/* Grades table */}
            <div className="overflow-x-auto border rounded-lg bg-card text-xs sm:text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3">Course Title</th>
                    <th className="p-3">Evaluation Term</th>
                    <th className="p-3">Theory (Score/Max)</th>
                    <th className="p-3">Practical (Score/Max)</th>
                    <th className="p-3">Aggregate Marks</th>
                    <th className="p-3">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-muted-foreground">
                  {activeChild.grades.map((grade: any) => (
                    <tr key={grade.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{grade.subject}</td>
                      <td className="p-3">{grade.examType} ({grade.term})</td>
                      <td className="p-3">{grade.theoryMarks}/{grade.maxMarks}</td>
                      <td className="p-3">0/0</td>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-200">
                        {grade.theoryMarks}/{grade.maxMarks} ({((grade.theoryMarks / grade.maxMarks) * 100).toFixed(0)}%)
                      </td>
                      <td className="p-3 font-bold text-primary">{grade.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. FEES TAB */}
      {activeTab === "fees" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Child Fee Management</h2>

          {/* Dues strip */}
          <div className="bg-slate-50 dark:bg-slate-900/30 border p-4 rounded-lg flex flex-wrap justify-between items-center gap-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground font-semibold">Outstanding Dues:</span>
              <h3 className="text-xl font-extrabold text-red-600 mt-0.5">
                ₹ {activeChild.feePayments.filter((f: any) => f.status === "UNPAID").reduce((sum: number, f: any) => sum + f.amount, 0)}
              </h3>
            </div>
            <div className="text-xs text-muted-foreground">
              Select payment method: Cards, UPI, or Bank drafts. Receipts generated instantly.
            </div>
          </div>

          {/* Dues table */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm">Bills History</h3>
            
            <div className="overflow-x-auto border rounded-lg bg-card text-xs sm:text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3">Fee Bill Title</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Receipt No</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-muted-foreground">
                  {activeChild.feePayments.map((fee: any) => (
                    <tr key={fee.id}>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{fee.title}</td>
                      <td className="p-3">{new Date(fee.dueDate).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-200">₹ {fee.amount}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          fee.status === "PAID"
                            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30"
                            : "bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300 border border-red-100 dark:border-red-900/30"
                        }`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{fee.receiptNo || "—"}</td>
                      <td className="p-3 text-right">
                        {fee.status === "PAID" ? (
                          <button
                            onClick={() => {
                              alert(`Receipt: ${fee.receiptNo}\nAmount: ₹ ${fee.amount}\nPaid via: ${fee.paymentMethod}\nTxn ID: ${fee.transactionId}`);
                            }}
                            className="inline-flex items-center gap-1 border border-primary text-primary hover:bg-primary hover:text-white px-2.5 py-1 rounded text-xs font-semibold cursor-pointer"
                          >
                            <Download size={12} /> Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => setPaymentModal(fee)}
                            className="bg-primary hover:bg-primary-hover text-white px-3 py-1 rounded text-xs font-semibold cursor-pointer"
                          >
                            Pay Online
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Modal */}
          {paymentModal && (
            <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
              <div className="bg-card border max-w-md w-full rounded-xl overflow-hidden shadow-2xl p-6 space-y-6">
                <div className="border-b pb-3 flex justify-between items-center">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Dues Checkout Portal</h3>
                  <button onClick={() => setPaymentModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">Close</button>
                </div>
                
                <div className="bg-muted p-4 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase">Bill Description</span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{paymentModal.title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-semibold uppercase">Amount Dues</span>
                    <h4 className="font-extrabold text-primary text-base mt-0.5">₹ {paymentModal.amount}</h4>
                  </div>
                </div>

                <form onSubmit={handlePayFeeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Payment Gateway Channel</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayMethod("UPI")}
                        className={`border p-2 rounded text-center text-xs font-semibold cursor-pointer ${
                          payMethod === "UPI" ? "border-primary bg-primary/10 text-primary" : "border-muted text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        UPI / QR code
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayMethod("CARD")}
                        className={`border p-2 rounded text-center text-xs font-semibold cursor-pointer ${
                          payMethod === "CARD" ? "border-primary bg-primary/10 text-primary" : "border-muted text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Debit/Credit Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayMethod("NET_BANKING")}
                        className={`border p-2 rounded text-center text-xs font-semibold cursor-pointer ${
                          payMethod === "NET_BANKING" ? "border-primary bg-primary/10 text-primary" : "border-muted text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Net Banking
                      </button>
                    </div>
                  </div>

                  {payMethod === "UPI" && (
                    <div className="border border-dashed p-4 rounded-lg text-center bg-slate-50 dark:bg-slate-900/30 space-y-2">
                      <div className="w-28 h-28 bg-white border mx-auto flex items-center justify-center font-bold text-xs select-none">
                        SIMULATED QR
                      </div>
                      <p className="text-[10px] text-muted-foreground">Scan this QR using your banking application to complete the simulated checkout.</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessingPay}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    <CheckCircle size={14} />
                    {isProcessingPay ? "Authorizing Dues Transfer..." : `Authorize Payment of ₹ ${paymentModal.amount}`}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TRANSPORT TAB */}
      {activeTab === "transport" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Bus Route & GPS Tracker</h2>

          {activeChild.transportRoute ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Details card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900/30 border p-5 rounded-lg space-y-3 shadow-inner">
                  <div className="flex items-center gap-3">
                    <Bus size={28} className="text-primary shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{activeChild.transportRoute.routeName}</h4>
                      <span className="text-[10px] font-bold text-slate-400 font-mono mt-0.5 block">{activeChild.transportRoute.vehicleNo}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 space-y-2 text-xs text-muted-foreground">
                    <div><strong>Driver Name:</strong> {activeChild.transportRoute.driverName}</div>
                    <div className="flex items-center gap-1">
                      <strong>Driver Phone:</strong> {activeChild.transportRoute.driverPhone} 
                      <a href={`tel:${activeChild.transportRoute.driverPhone}`} className="text-primary ml-1 hover:underline flex items-center gap-0.5"><Phone size={12} /> Call</a>
                    </div>
                    <div><strong>Designated Stop:</strong> {activeChild.transportStop}</div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-lg flex gap-2 text-xs text-amber-800 dark:text-amber-300 leading-normal">
                  <AlertCircle className="shrink-0 w-4 h-4 text-amber-600 mt-0.5" />
                  <span>Bus coordinates update every 15 seconds. Ensure you arrive at your stop 5 minutes prior to the scheduled time.</span>
                </div>
              </div>

              {/* Map simulator */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <h3 className="font-bold">Live GPS Visualizer</h3>
                  <button 
                    onClick={() => setIsTrackingBus(!isTrackingBus)}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    {isTrackingBus ? "Pause tracking" : "Start tracking"}
                  </button>
                </div>

                {/* Simulated GPS SVG drawing */}
                <div className="bg-slate-100 dark:bg-slate-900 border rounded-xl h-80 relative overflow-hidden shadow-inner flex items-center justify-center p-4">
                  <svg className="w-full h-full max-w-md max-h-[260px]" viewBox="0 0 300 200">
                    {/* Road track */}
                    <path
                      d="M 20 150 Q 80 50, 150 120 T 280 50"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 20 150 Q 80 50, 150 120 T 280 50"
                      fill="none"
                      stroke="#475569"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />

                    {/* Stops markers */}
                    <circle cx="20" cy="150" r="5" fill="#f2a900" stroke="#fff" strokeWidth="1" />
                    <text x="25" y="165" fill="#64748b" fontSize="8" fontWeight="bold">Mathalput</text>

                    <circle cx="150" cy="120" r="5" fill="#f2a900" stroke="#fff" strokeWidth="1" />
                    <text x="155" y="135" fill="#64748b" fontSize="8" fontWeight="bold">Nalco Sector 1</text>

                    <circle cx="280" cy="50" r="6" fill="#0B7A3B" stroke="#fff" strokeWidth="1.5" />
                    <text x="250" y="40" fill="#0B7A3B" fontSize="8" fontWeight="bold">DPS Campus</text>

                    {/* Animated bus marker along path */}
                    <g 
                      transform={`translate(${
                        // Simple SVG path position interpolation
                        busPosition < 50
                          ? 20 + (busPosition / 50) * 130
                          : 150 + ((busPosition - 50) / 50) * 130
                      }, ${
                        busPosition < 50
                          ? 150 - (busPosition / 50) * 30
                          : 120 - ((busPosition - 50) / 50) * 70
                      })`}
                    >
                      <circle cx="0" cy="0" r="8" fill="#0B7A3B" className="animate-ping opacity-25" />
                      <circle cx="0" cy="0" r="5" fill="#0B7A3B" stroke="#fff" strokeWidth="1" />
                    </g>
                  </svg>
                  
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-950/95 border p-2.5 rounded-lg text-[10px] shadow flex justify-between items-center">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Current Status:</span>
                    <span className="text-primary font-bold animate-pulse">Bus is moving toward Sector 1 (3 mins away)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No transport route assigned to this student profile.</p>
          )}
        </div>
      )}

      {/* 5. COMMUNICATION TAB */}
      {activeTab === "chat" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="border-b pb-4 flex gap-3 items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
              SS
            </div>
            <div>
              <h2 className="text-sm font-bold leading-none">Sunita Sharma</h2>
              <span className="text-[10px] text-muted-foreground mt-1 block">Class Teacher / Math Educator</span>
            </div>
          </div>

          {/* Messages window */}
          <div className="border rounded-lg bg-slate-50 dark:bg-slate-900/30 p-4 h-80 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[80%] p-3 rounded-lg text-xs leading-relaxed space-y-1 ${
                  msg.sender === "PARENT"
                    ? "bg-primary text-white ml-auto rounded-tr-none"
                    : "bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300 mr-auto rounded-tl-none"
                }`}
              >
                <p className="font-medium">{msg.text}</p>
                <span className={`block text-[9px] text-right ${msg.sender === "PARENT" ? "text-primary-foreground/75" : "text-slate-400"}`}>
                  {msg.date}
                </span>
              </div>
            ))}
          </div>

          {/* Typing input */}
          <form onSubmit={sendChatMessage} className="flex gap-2">
            <input
              type="text"
              required
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Type your message to Sunita Sharma..."
              className="border text-xs rounded p-3 focus:ring focus:outline-none bg-background shrink grow"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white text-xs px-5 rounded font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      )}

      {/* 6. LEAVE TAB */}
      {activeTab === "leave" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Apply Child Leave</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Leave Apply Form */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-bold text-sm">Filing on behalf of {activeChild.user.name}</h3>
              
              {leaveSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                  Leave application registered. Notifications dispatched.
                </div>
              )}

              <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Start Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">End Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Reason for Leave</label>
                  <textarea
                    required
                    rows={3}
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    placeholder="Enter details..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={leaveSubmitting}
                  className="bg-primary hover:bg-primary-hover text-white text-xs px-4 py-2 rounded font-bold transition-colors cursor-pointer"
                >
                  {leaveSubmitting ? "Filing..." : "Submit Leave Application"}
                </button>
              </form>
            </div>

            {/* Leave History List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-bold text-sm">Leave History Logs</h3>
              <div className="overflow-x-auto border rounded-lg bg-card text-xs sm:text-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-3">Filing Date</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-muted-foreground">
                    {leaveHistory.map((leave) => (
                      <tr key={leave.id}>
                        <td className="p-3">{new Date(leave.appliedDate).toLocaleDateString()}</td>
                        <td className="p-3">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="p-3 truncate max-w-[150px]">{leave.reason}</td>
                        <td className="p-3 text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            leave.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30"
                              : "bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30"
                          }`}>
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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

export default function ParentDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ParentDashboardContent />
    </Suspense>
  );
}
