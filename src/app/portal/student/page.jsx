"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  User, ClipboardList, BookOpen, FileSpreadsheet, 
  CreditCard, Calendar, FileText, CheckCircle, Clock,
  ArrowRight, Download, Printer, Plus, AlertCircle
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

function StudentDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [studentData, setStudentData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Homework mock submits
  const [homeworks, setHomeworks] = useState([
    { id: 1, subject: "Mathematics", task: "Solve Exercises 3.2 and 3.3 in Linear Equations notebook.", assigned: "02-June-2026", due: "05-June-2026", status: "Pending" },
    { id: 2, subject: "Physics", task: "Complete the practical observation sheet for Refraction through glass prism.", assigned: "01-June-2026", due: "04-June-2026", status: "Pending" },
    { id: 3, subject: "English", task: "Read Act 3 of Shakespeare's Julius Caesar and answer comprehension questions.", assigned: "29-May-2026", due: "02-June-2026", status: "Completed" }
  ]);



  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
    if (user) {
      fetchDashboardData();
      fetchLeavesData();
    }
  }, [user]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/student");
      const data = await res.json();
      if (data.success) {
        setStudentData(data.student);
        setAnnouncements(data.announcements);
      } else {
        setError(data.error || "Failed to load dashboard data");
      }
    } catch (err) {
      setError("Network error loading dashboard data");
    } finally {
      setLoading(false);
    }
  }

  async function fetchLeavesData() {
    try {
      const res = await fetch(`/api/portal/leaves?userId=${user?.id}`);
      // Fallback in case endpoint is not fully ready
      const dummyHistory = [
        { id: 1, startDate: new Date(Date.now() + 172800000), endDate: new Date(Date.now() + 345600000), reason: "Attending elder sister's wedding.", status: "APPROVED", appliedDate: new Date(Date.now() - 259200000), comments: "Approved by Sunita Sharma." }
      ];
      setLeaveHistory(dummyHistory);
    } catch (e) {
      // ignore
    }
  }


  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveSubmitting(true);
    setLeaveSuccess(false);

    try {
      const res = await fetch("/api/portal/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          role: "STUDENT",
          ...leaveForm
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLeaveSuccess(true);
        setLeaveForm({ startDate: "", endDate: "", reason: "" });
        // Add to local list
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
        alert(data.error || "Failed to submit leave application");
      }
    } catch (err) {
      alert("Error submitting leave application");
    } finally {
      setLeaveSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="flex-1 p-8 text-center text-red-500">
        <AlertCircle className="mx-auto w-10 h-10 mb-2" />
        <p className="font-bold">{error || "Failed to initialize student profile"}</p>
        <button onClick={fetchDashboardData} className="mt-4 text-xs font-semibold text-primary underline">Retry</button>
      </div>
    );
  }

  // Calculate Attendance Stats
  const totalDays = studentData.attendance.length;
  const presentDays = studentData.attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0.0";

  // Grades Recharts formatting
  const midtermGrades = studentData.grades
    .filter((g) => g.examType === "MID_TERM")
    .map((g) => ({
      subject: g.subject.substring(0, 7), // short name
      marks: g.theoryMarks,
      max: g.maxMarks,
      percentage: ((g.theoryMarks / g.maxMarks) * 100).toFixed(1)
    }));

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* HEADER TABS CONDITIONAL LAYOUT */}
      
      {/* 1. DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          {/* Welcome header */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Student Dashboard</h1>
              <p className="text-xs text-muted-foreground">Welcome back, {studentData.user.name}. Track your daily records.</p>
            </div>
            <span className="text-xs font-bold border px-3 py-1 bg-card rounded shadow-sm text-primary">
              Academic Year: 2025-2026
            </span>
          </div>

          {/* Quick Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Attendance</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-primary">{attendanceRate}%</span>
                <span className="text-[10px] text-muted-foreground">({presentDays}/{totalDays} Days)</span>
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Homework Dues</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-amber-600">
                  {homeworks.filter(h => h.status === "Pending").length}
                </span>
                <span className="text-[10px] text-muted-foreground">Assignments Pending</span>
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Issued Books</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-200">
                  {studentData.bookIssues.filter((b) => b.status === "ISSUED").length}
                </span>
                <span className="text-[10px] text-muted-foreground">Active Check-outs</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recharts Grades Progression & Notices */}
            <div className="lg:col-span-8 space-y-6">
              {/* Performance Chart */}
              <div className="bg-card border rounded-lg p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Mid-Term Grades Performance (%)</h3>
                <div className="h-64 w-full text-xs">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={midtermGrades} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="subject" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="percentage" fill="#0B7A3B" name="Score" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Active notices */}
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

            {/* Sidebar widgets (Digital ID Card) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Digital ID Card */}
              <div className="bg-gradient-to-br from-primary/10 to-slate-900/5 dark:from-slate-900 dark:to-slate-950 border border-primary/20 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-center text-slate-800 dark:text-white flex items-center justify-center gap-1.5">
                  <User size={16} className="text-primary" /> Digital ID Card
                </h3>
                
                {/* Print Layout container */}
                <div className="bg-card border border-primary/30 p-4 rounded-lg shadow-md space-y-4 relative overflow-hidden print-card">
                  {/* Watermark logo */}
                  <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none select-none">
                    <User size={100} />
                  </div>
                  
                  {/* Top card banner */}
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h4 className="font-bold text-xs leading-none text-primary">DELHI PUBLIC SCHOOL</h4>
                      <span className="text-[8px] font-bold text-slate-400 tracking-widest leading-none mt-1 block">DAMANJODI</span>
                    </div>
                    <span className="text-[8px] bg-slate-900 text-white font-bold px-1.5 py-0.5 rounded leading-none shrink-0 uppercase">Student</span>
                  </div>

                  {/* Student details */}
                  <div className="flex gap-4 items-center py-2">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img src={studentData.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentData.user.name)}`} alt="Student avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs space-y-1 overflow-hidden leading-tight">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{studentData.user.name}</div>
                      <div><span className="font-semibold text-slate-400">Class:</span> {studentData.class}-{studentData.section}</div>
                      <div><span className="font-semibold text-slate-400">Roll No:</span> {studentData.rollNo}</div>
                      <div><span className="font-semibold text-slate-400">Blood Gp:</span> {studentData.bloodGroup}</div>
                      <div><span className="font-semibold text-slate-400">Adm No:</span> {studentData.admissionNo}</div>
                    </div>
                  </div>

                  {/* QR simulation */}
                  <div className="border-t pt-3 flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                    <span>{studentData.admissionNo}</span>
                    <div className="w-10 h-10 bg-slate-200 border rounded shrink-0 flex items-center justify-center font-bold text-[8px] select-none uppercase">
                      QR code
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white py-2 rounded-md font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer no-print"
                >
                  <Printer size={14} /> Print ID Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE TAB */}
      {activeTab === "attendance" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Attendance Records</h2>

          {/* Attendance Stats Cards */}
          <div className="grid grid-cols-3 gap-4 border-b pb-6">
            <div className="text-center space-y-1">
              <span className="block text-xl sm:text-2xl font-extrabold text-primary">{attendanceRate}%</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Attendance Rate</span>
            </div>
            <div className="text-center space-y-1 border-x px-2">
              <span className="block text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-200">{presentDays}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Days Present</span>
            </div>
            <div className="text-center space-y-1">
              <span className="block text-xl sm:text-2xl font-extrabold text-red-600">
                {studentData.attendance.filter((a) => a.status === "ABSENT").length}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Days Absent</span>
            </div>
          </div>

          {/* Attendance List */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm">Latest Attendance Logs</h3>
            <div className="overflow-x-auto border rounded-lg bg-card text-xs sm:text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Marked By</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-muted-foreground">
                  {studentData.attendance.slice(0, 10).map((record) => (
                    <tr key={record.id}>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">
                        {new Date(record.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          record.status === "PRESENT" 
                            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30"
                            : record.status === "LATE"
                            ? "bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30"
                            : "bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300 border border-red-100 dark:border-red-900/30"
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-3">Sunita Sharma</td>
                      <td className="p-3">Daily roll call</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TIMETABLE TAB */}
      {activeTab === "timetable" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Class Timetable (10-A)</h2>
          
          <div className="overflow-x-auto border rounded-lg bg-card text-xs sm:text-sm">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3">Day</th>
                  <th className="p-3">Period 1 (08:30-09:15)</th>
                  <th className="p-3">Period 2 (09:15-10:00)</th>
                  <th className="p-3">Period 3 (10:00-10:45)</th>
                  <th className="p-3">Lunch Break (10:45-11:15)</th>
                  <th className="p-3">Period 4 (11:15-12:00)</th>
                  <th className="p-3">Period 5 (12:00-12:45)</th>
                  <th className="p-3">Period 6 (12:45-01:30)</th>
                </tr>
              </thead>
              <tbody className="divide-y text-muted-foreground">
                {[
                  { day: "Mon", p1: "Math", p2: "Physics", p3: "English", p4: "Social Sci", p5: "Odia", p6: "Lib" },
                  { day: "Tue", p1: "Chem", p2: "Math", p3: "Comp Sci", p4: "English", p5: "Social Sci", p6: "Games" },
                  { day: "Wed", p1: "Physics", p2: "Biology", p3: "Math", p4: "Odia", p5: "English", p6: "Arts" },
                  { day: "Thu", p1: "Math", p2: "Chem", p3: "Social Sci", p4: "Comp Sci", p5: "Physics", p6: "Sanskrit" },
                  { day: "Fri", p1: "English", p2: "Math", p3: "Biology", p4: "Social Sci", p5: "Odia", p6: "Lab" },
                  { day: "Sat", p1: "Math", p2: "Comp Sci", p3: "Club", p4: "PT", p5: "Library", p6: "Special Session" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100 bg-muted/30">{row.day}</td>
                    <td className="p-3 font-medium">{row.p1}</td>
                    <td className="p-3 font-medium">{row.p2}</td>
                    <td className="p-3 font-medium">{row.p3}</td>
                    <td className="p-3 font-semibold text-slate-400 bg-slate-50 dark:bg-slate-900/30">LUNCH</td>
                    <td className="p-3 font-medium">{row.p4}</td>
                    <td className="p-3 font-medium">{row.p5}</td>
                    <td className="p-3 font-medium">{row.p6}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. HOMEWORK TAB */}
      {activeTab === "homework" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Assignments & Homework</h2>

          <div className="space-y-4">
            {homeworks.map((hw) => (
              <div key={hw.id} className="border p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{hw.subject}</span>
                    <span className="text-xs text-muted-foreground">Assigned: {hw.assigned} • Due: {hw.due}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug">{hw.task}</h4>
                </div>
                <div className="flex gap-2 self-end sm:self-center shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded inline-block ${
                    hw.status === "Completed"
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30"
                      : "bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30"
                  }`}>
                    {hw.status}
                  </span>
                  {hw.status === "Pending" && (
                    <button
                      onClick={() => {
                        const updated = homeworks.map(h => h.id === hw.id ? { ...h, status: "Completed" } : h);
                        setHomeworks(updated);
                        alert("Assignment marked as completed!");
                      }}
                      className="bg-primary hover:bg-primary-hover text-white text-xs px-2.5 py-1 rounded font-bold cursor-pointer"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. GRADES & REPORT CARD TAB */}
      {activeTab === "grades" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in print-card">
          <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold">Academic Report Card</h2>
              <p className="text-xs text-muted-foreground">Consolidated scores breakdown across semesters.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-primary hover:bg-primary-hover text-white text-xs px-3 py-2 rounded font-bold transition-all flex items-center gap-1 cursor-pointer no-print"
            >
              <Download size={14} /> Download PDF Report Card
            </button>
          </div>

          <div className="space-y-6">
            {/* Performance analysis metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/30 border p-4 rounded-lg text-center text-sm">
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-400">Total Marks</span>
                <span className="block text-base font-extrabold text-slate-800 dark:text-white">
                  {studentData.grades.filter((g) => g.examType === "MID_TERM").reduce((sum, g) => sum + g.theoryMarks, 0)}
                  /
                  {studentData.grades.filter((g) => g.examType === "MID_TERM").reduce((sum, g) => sum + g.maxMarks, 0)}
                </span>
              </div>
              <div className="space-y-1 border-x px-2">
                <span className="block text-xs font-bold text-slate-400">Percentage</span>
                <span className="block text-base font-extrabold text-primary">
                  {(
                    (studentData.grades.filter((g) => g.examType === "MID_TERM").reduce((sum, g) => sum + g.theoryMarks, 0) /
                     studentData.grades.filter((g) => g.examType === "MID_TERM").reduce((sum, g) => sum + g.maxMarks, 0)) * 100
                  ).toFixed(1)}%
                </span>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0">
                <span className="block text-xs font-bold text-slate-400">Overall Grade / CGPA</span>
                <span className="block text-base font-extrabold text-secondary">A2 / 8.8 CGPA</span>
              </div>
            </div>

            {/* Grades Table */}
            <div className="overflow-x-auto border rounded-lg bg-card text-xs sm:text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3">Subject Name</th>
                    <th className="p-3">Exam Term</th>
                    <th className="p-3">Theory (Score/Max)</th>
                    <th className="p-3">Practical (Score/Max)</th>
                    <th className="p-3">Total Marks</th>
                    <th className="p-3">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-muted-foreground">
                  {studentData.grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{grade.subject}</td>
                      <td className="p-3">{grade.examType} ({grade.term})</td>
                      <td className="p-3">{grade.theoryMarks}/{grade.maxMarks}</td>
                      <td className="p-3">0/0</td>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-200">
                        {grade.theoryMarks}/{grade.maxMarks} ({((grade.theoryMarks / grade.maxMarks) * 100).toFixed(0)}%)
                      </td>
                      <td className="p-3">
                        <span className="font-extrabold text-primary">{grade.grade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* 7. LEAVE REQUEST TAB */}
      {activeTab === "leave" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Leave Application Portal</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Leave Apply Form */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-bold text-sm">File Leave Application</h3>
              
              {leaveSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                  Application recorded successfully. Class teacher notified.
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
                  {leaveSubmitting ? "Filing..." : "Submit Application"}
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

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <StudentDashboardContent />
    </Suspense>
  );
}
