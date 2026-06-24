"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  User, ClipboardList, BookOpen, FileSpreadsheet, 
  MessageSquare, UserCheck, CheckCircle2, XCircle, 
  Send, UserX, UserPlus, AlertCircle, Plus, Calendar,
  Bell
} from "lucide-react";

function TeacherDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [teacherData, setTeacherData] = useState(null);
  const [students, setStudents] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Attendance Register state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().substring(0, 10));
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attSaving, setAttSaving] = useState(false);

  // Grades entry state
  const [gradeForm, setGradeForm] = useState({
    studentId: "",
    subject: "Mathematics",
    examType: "MID_TERM",
    theoryMarks: "",
    maxMarks: "100"
  });
  const [gradeSaving, setGradeSaving] = useState(false);
  const [gradeSuccess, setGradeSuccess] = useState(false);

  // Assignments upload state
  const [assignments, setAssignments] = useState([
    { id: 1, subject: "Mathematics", task: "Solve Exercises 3.2 and 3.3 in Linear Equations notebook.", assigned: "02-June-2026", due: "05-June-2026" },
    { id: 2, subject: "Physics", task: "Complete the practical observation sheet for Refraction through glass prism.", assigned: "01-June-2026", due: "04-June-2026" }
  ]);
  const [newAssignment, setNewAssignment] = useState({ subject: "Mathematics", task: "", due: "" });

  // Chat Simulation State
  const [messages, setMessages] = useState([
    { id: 1, sender: "TEACHER", text: "Dear Parent, Rahul has been doing excellent in Mathematics but needs to focus more on drawing practical physics graphs.", date: "02-June-2026 11:20 AM" },
    { id: 2, sender: "PARENT", text: "Thank you for the update Sunita ji. I will sit with him tonight and verify his physics experiments folder.", date: "02-June-2026 04:30 PM" },
    { id: 3, sender: "TEACHER", text: "Great. Also, please ensure he attends the special math guidance session this Friday.", date: "03-June-2026 09:10 AM" }
  ]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  async function fetchTeacherData() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/teacher");
      const data = await res.json();
      if (data.success) {
        setTeacherData(data.teacher);
        setStudents(data.students);
        setPendingLeaves(data.pendingLeaves);
        setAnnouncements(data.announcements);
        
        // Initialize attendance records mapping studentId -> 'PRESENT'
        const initialRecords = {};
        data.students.forEach((student) => {
          initialRecords[student.id] = "PRESENT";
        });
        setAttendanceRecords(initialRecords);
      } else {
        setError(data.error || "Failed to load teacher data");
      }
    } catch (err) {
      setError("Network error loading dashboard data");
    } finally {
      setLoading(false);
    }
  }

  const handleMarkAllPresent = () => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = "PRESENT";
    });
    setAttendanceRecords(updated);
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setAttSaving(true);

    const formattedRecords = Object.keys(attendanceRecords).map((studentId) => ({
      studentId,
      status: attendanceRecords[studentId]
    }));

    try {
      const res = await fetch("/api/portal/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: attendanceDate,
          records: formattedRecords,
          teacherId: user?.teacherProfileId || user?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.error || "Failed to save attendance");
      }
    } catch (err) {
      alert("Error saving attendance");
    } finally {
      setAttSaving(false);
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setGradeSaving(true);
    setGradeSuccess(false);

    try {
      const res = await fetch("/api/portal/teacher/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...gradeForm,
          term: "Term 1",
          academicYear: "2025-2026"
        })
      });
      const data = await res.json();
      if (data.success) {
        setGradeSuccess(true);
        setGradeForm({
          studentId: "",
          subject: "Mathematics",
          examType: "MID_TERM",
          theoryMarks: "",
          maxMarks: "100"
        });
      } else {
        alert(data.error || "Failed to upload grades");
      }
    } catch (err) {
      alert("Error uploading grades");
    } finally {
      setGradeSaving(false);
    }
  };

  const handleLeaveDecision = async (leaveId, decision) => {
    try {
      const res = await fetch("/api/portal/leaves/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId, status: decision, comments: `Processed by ${teacherData.user.name}` })
      });
      const data = await res.json();
      if (data.success) {
        // Remove from local list
        setPendingLeaves(pendingLeaves.filter((l) => l.id !== leaveId));
        alert(`Leave request ${decision.toLowerCase()}!`);
      } else {
        alert(data.error || "Failed to process leave decision");
      }
    } catch (err) {
      alert("Error updating leave request");
    }
  };

  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (!newAssignment.task || !newAssignment.due) return;
    
    const addedHw = {
      id: assignments.length + 1,
      subject: newAssignment.subject,
      task: newAssignment.task,
      assigned: new Date().toLocaleDateString(),
      due: new Date(newAssignment.due).toLocaleDateString()
    };

    setAssignments([addedHw, ...assignments]);
    setNewAssignment({ subject: "Mathematics", task: "", due: "" });
    alert("Assignment published and student portals updated!");
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const timeString = new Date().toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const userMsg = {
      id: messages.length + 1,
      sender: "TEACHER",
      text: newMsg.trim(),
      date: `Today ${timeString}`
    };

    setMessages([...messages, userMsg]);
    setNewMsg("");

    // Simulate parent response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "PARENT",
          text: "Thank you for the update Sunita ji. I will sit with him tonight and verify his physics experiments folder.",
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

  if (error || !teacherData) {
    return (
      <div className="flex-1 p-8 text-center text-red-500">
        <AlertCircle className="mx-auto w-10 h-10 mb-2" />
        <p className="font-bold">{error || "Failed to initialize teacher profile"}</p>
        <button onClick={fetchTeacherData} className="mt-4 text-xs font-semibold text-primary underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* CONDITIONAL LAYOUTS */}

      {/* 1. DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Teacher Dashboard</h1>
            <p className="text-xs text-muted-foreground">Classroom records management console for {teacherData.user.name}.</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Assigned Homeroom</span>
              <div className="flex items-baseline gap-1 mt-1.5 font-extrabold text-xl sm:text-2xl text-primary">
                Class 10-A
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Total Students</span>
              <div className="flex items-baseline gap-1 mt-1.5 font-extrabold text-xl sm:text-2xl text-slate-850 dark:text-slate-200">
                {students.length} Students
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Pending Leaves</span>
              <div className="flex items-baseline gap-1 mt-1.5 font-extrabold text-xl sm:text-2xl text-amber-600">
                {pendingLeaves.length} Applications
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Department</span>
              <div className="flex items-baseline gap-1 mt-1.5 font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                {teacherData.department}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Notices and student roster summaries */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-card border rounded-lg p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Class Room Roster (10-A)</h3>
                
                <div className="overflow-x-auto border rounded bg-card text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-2.5">Roll No</th>
                        <th className="p-2.5">Student Name</th>
                        <th className="p-2.5">Admission No</th>
                        <th className="p-2.5">Gender</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-muted-foreground">
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{student.rollNo}</td>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{student.user.name}</td>
                          <td className="p-2.5 font-mono">{student.admissionNo}</td>
                          <td className="p-2.5">{student.gender || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              {/* Profile card */}
              <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4 text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-primary">
                  <img src={teacherData.user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(teacherData.user?.name || 'T')}`} alt="Teacher avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-none">{teacherData.user.name}</h3>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1 block">{teacherData.qualification}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/30 border p-3 rounded text-[11px] text-muted-foreground text-left leading-normal space-y-1">
                  <div><strong>Employee ID:</strong> {teacherData.employeeId}</div>
                  <div><strong>Department:</strong> {teacherData.department}</div>
                  <div><strong>Contact Info:</strong> {teacherData.user?.phone || "N/A"}</div>
                </div>
              </div>

              {/* Notice Board */}
              <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4 text-left">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-205 flex items-center gap-1.5">
                  <Bell size={16} className="text-primary animate-pulse" /> Notice Board
                </h3>
                <div className="space-y-3.5">
                  {announcements && announcements.length > 0 ? (
                    announcements.slice(0, 4).map((notice) => (
                      <div key={notice.id} className="border-l-4 border-primary pl-3 py-0.5 space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-450 uppercase">
                          {new Date(notice.date).toLocaleDateString()} • {notice.category}
                        </span>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-tight">{notice.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{notice.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No notices currently active.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CLASS ATTENDANCE REGISTER */}
      {activeTab === "attendance" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold">Class Attendance Register (Class 10-A)</h2>
              <p className="text-xs text-muted-foreground">Select date and mark student roll calls below.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="border text-xs rounded p-2 focus:ring focus:outline-none bg-background font-semibold"
              />
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="border border-primary text-primary hover:bg-primary hover:text-white text-xs px-3 py-2 rounded font-bold cursor-pointer"
              >
                Mark All Present
              </button>
            </div>
          </div>

          <form onSubmit={handleAttendanceSubmit} className="space-y-6">
            <div className="overflow-x-auto border rounded-lg bg-card text-xs sm:text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Admission No</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3 text-right">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-muted-foreground">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{student.rollNo}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{student.user.name}</td>
                      <td className="p-3 font-mono">{student.admissionNo}</td>
                      <td className="p-3">{student.gender}</td>
                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          {["PRESENT", "LATE", "ABSENT"].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setAttendanceRecords({ ...attendanceRecords, [student.id]: status })}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                attendanceRecords[student.id] === status
                                  ? status === "PRESENT"
                                    ? "bg-emerald-500 text-white border-emerald-500"
                                    : status === "LATE"
                                    ? "bg-amber-500 text-white border-amber-500"
                                    : "bg-red-500 text-white border-red-500"
                                  : "bg-background text-muted-foreground hover:bg-muted border-muted"
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="submit"
              disabled={attSaving}
              className="bg-primary hover:bg-primary-hover text-white text-xs px-5 py-2.5 rounded font-bold shadow transition-colors cursor-pointer"
            >
              {attSaving ? "Saving attendance..." : "Submit Attendance Sheet"}
            </button>
          </form>
        </div>
      )}

      {/* 3. GRADES ENTRY */}
      {activeTab === "grades" && (
        <div className="max-w-2xl mx-auto bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold font-sans">Grade Card Upload Panel</h2>
            <p className="text-xs text-muted-foreground font-semibold">Enter terminal exam marks for students of Class 10-A.</p>
          </div>

          {gradeSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
              Grade card added to database. Student reports updated.
            </div>
          )}

          <form onSubmit={handleGradeSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Select Student</label>
              <select
                value={gradeForm.studentId}
                onChange={(e) => { setGradeForm({ ...gradeForm, studentId: e.target.value }); setGradeSuccess(false); }}
                className="w-full border rounded p-2.5 focus:ring focus:outline-none bg-background text-xs sm:text-sm"
                required
              >
                <option value="">Choose student from homeroom...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.rollNo}. {student.user.name} ({student.admissionNo})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Subject Course</label>
                <select
                  value={gradeForm.subject}
                  onChange={(e) => { setGradeForm({ ...gradeForm, subject: e.target.value }); setGradeSuccess(false); }}
                  className="w-full border rounded p-2.5 focus:ring focus:outline-none bg-background text-xs sm:text-sm"
                >
                  {["Mathematics", "Science", "English", "Social Studies", "Odia", "Computer Science"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Evaluation Term</label>
                <select
                  value={gradeForm.examType}
                  onChange={(e) => { setGradeForm({ ...gradeForm, examType: e.target.value }); setGradeSuccess(false); }}
                  className="w-full border rounded p-2.5 focus:ring focus:outline-none bg-background text-xs sm:text-sm"
                >
                  <option value="UNIT_1">Unit Test 1 (Max: 40)</option>
                  <option value="MID_TERM">Mid-Term Exams (Max: 100)</option>
                  <option value="UNIT_2">Unit Test 2 (Max: 40)</option>
                  <option value="FINAL">Final Exams (Max: 100)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Marks Secured</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={gradeForm.theoryMarks}
                  onChange={(e) => { setGradeForm({ ...gradeForm, theoryMarks: e.target.value }); setGradeSuccess(false); }}
                  className="w-full border rounded p-2.5 focus:ring focus:outline-none bg-background text-xs sm:text-sm"
                  placeholder="e.g. 78.5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Maximum Marks</label>
                <input
                  type="number"
                  required
                  value={gradeForm.maxMarks}
                  onChange={(e) => { setGradeForm({ ...gradeForm, maxMarks: e.target.value }); setGradeSuccess(false); }}
                  className="w-full border rounded p-2.5 focus:ring focus:outline-none bg-background text-xs sm:text-sm"
                  placeholder="e.g. 100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={gradeSaving}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded font-bold text-xs shadow transition-colors cursor-pointer"
            >
              {gradeSaving ? "Saving Grade Card..." : "Save Grade Record"}
            </button>
          </form>
        </div>
      )}

      {/* 4. ASSIGNMENTS UPLOADER */}
      {activeTab === "assignments" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Homework & Assignments Publisher</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Publisher Form */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-bold text-sm">Publish New Assignment</h3>
              
              <form onSubmit={handleAddAssignment} className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Subject Course</label>
                  <select
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background text-xs sm:text-sm"
                  >
                    {["Mathematics", "Science", "English", "Social Studies", "Odia", "Computer Science"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Assignment Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={newAssignment.due}
                    onChange={(e) => setNewAssignment({ ...newAssignment, due: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Task Details / Instructions</label>
                  <textarea
                    required
                    rows={4}
                    value={newAssignment.task}
                    onChange={(e) => setNewAssignment({ ...newAssignment, task: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background text-xs sm:text-sm"
                    placeholder="Enter homework instructions..."
                  />
                </div>

                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white text-xs px-4 py-2.5 rounded font-bold shadow transition-colors cursor-pointer"
                >
                  Publish to Portals
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-bold text-sm">Active Assignments</h3>
              
              <div className="space-y-4">
                {assignments.map((hw) => (
                  <div key={hw.id} className="border p-4 rounded-lg shadow-sm flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{hw.subject}</span>
                      <span className="text-xs text-muted-foreground">Due: {hw.due}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{hw.task}</h4>
                    <span className="text-[10px] text-muted-foreground mt-2 border-t pt-2 block">Assigned date: {hw.assigned}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. LEAVES REVIEW */}
      {activeTab === "leaves" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Student Leave Applications Pending Approval</h2>

          <div className="space-y-4">
            {pendingLeaves.length > 0 ? (
              pendingLeaves.map((leave) => (
                <div key={leave.id} className="border p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-800 dark:text-white">{leave.user.name}</span>
                      <span className="text-[10px] text-muted-foreground">Applied: {new Date(leave.appliedDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-semibold text-primary">
                      Duration: {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground leading-normal italic">
                      &quot;{leave.reason}&quot;
                    </p>
                  </div>
                  
                  <div className="flex gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleLeaveDecision(leave.id, "APPROVED")}
                      className="bg-primary hover:bg-primary-hover text-white text-xs px-3 py-1.5 rounded font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleLeaveDecision(leave.id, "REJECTED")}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No leave applications currently awaiting decision.</p>
            )}
          </div>
        </div>
      )}

      {/* 6. COMMUNICATION (CHAT WITH PARENTS) */}
      {activeTab === "chat" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="border-b pb-4 flex gap-3 items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
              RM
            </div>
            <div>
              <h2 className="text-sm font-bold leading-none">Ramesh Chandra Mohanty</h2>
              <span className="text-[10px] text-muted-foreground mt-1 block">Parent of Rahul Mohanty (Roll: 15)</span>
            </div>
          </div>

          {/* Messages block */}
          <div className="border rounded-lg bg-slate-50 dark:bg-slate-900/30 p-4 h-80 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[80%] p-3 rounded-lg text-xs leading-relaxed space-y-1 ${
                  msg.sender === "TEACHER"
                    ? "bg-primary text-white ml-auto rounded-tr-none"
                    : "bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300 mr-auto rounded-tl-none"
                }`}
              >
                <p className="font-medium">{msg.text}</p>
                <span className={`block text-[9px] text-right ${msg.sender === "TEACHER" ? "text-primary-foreground/75" : "text-slate-400"}`}>
                  {msg.date}
                </span>
              </div>
            ))}
          </div>

          {/* Input typing */}
          <form onSubmit={sendChatMessage} className="flex gap-2">
            <input
              type="text"
              required
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Type your response to Ramesh Mohanty..."
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

    </div>
  );
}

export default function TeacherDashboardPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <TeacherDashboardContent />
    </React.Suspense>
  );
}
