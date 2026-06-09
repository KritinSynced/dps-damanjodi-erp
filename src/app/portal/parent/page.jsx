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

  const [parentData, setParentData] = useState(null);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Chat Simulation State
  const [messages, setMessages] = useState([
    { id: 1, sender: "TEACHER", text: "Dear Parent, Rahul has been doing excellent in Mathematics but needs to focus more on drawing practical physics graphs.", date: "02-June-2026 11:20 AM" },
    { id: 2, sender: "PARENT", text: "Thank you for the update Sunita ji. I will sit with him tonight and verify his physics experiments folder.", date: "02-June-2026 04:30 PM" },
    { id: 3, sender: "TEACHER", text: "Great. Also, please ensure he attends the special math guidance session this Friday.", date: "03-June-2026 09:10 AM" }
  ]);
  const [newMsg, setNewMsg] = useState("");



  useEffect(() => {
    setIsMounted(true);
    if (user?.parentId) {
      fetchParentData();
    }
  }, [user]);

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);

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


  const handleLeaveSubmit = async (e) => {
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

  const sendChatMessage = (e) => {
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
  const presentDays = activeChild.attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0.0";

  // Grades Recharts formatting
  const childGrades = activeChild.grades
    .filter((g) => g.examType === "MID_TERM")
    .map((g) => ({
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
              {parentData.students.map((child, idx) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Attendance</span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-primary">{attendanceRate}%</span>
                <span className="text-[10px] text-muted-foreground">({presentDays}/{totalDays} Days)</span>
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Reports & GPA</span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-200">8.8 GPA</span>
                <span className="text-[10px] text-muted-foreground">(Class 10 Mid-Term)</span>
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
                  {activeChild.grades.map((grade) => (
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
