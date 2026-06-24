"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, UserPlus, BookOpen, 
  Bell, FileText, CheckCircle2, AlertCircle, Plus,
  ShieldCheck, Lock, Activity, Library
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

function AdminDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [archivedAnnouncements, setArchivedAnnouncements] = useState([]);
  const [announcementsTab, setAnnouncementsTab] = useState("active"); // "active" or "archived"

  // Lists state
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [books, setBooks] = useState([]);

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    name: "", email: "", dateOfBirth: "", className: "10", section: "A", rollNo: "",
    parentName: "", parentEmail: "", phone: "", address: "", role: "STUDENT"
  });
  const [studSaving, setStudSaving] = useState(false);
  const [studSuccess, setStudSuccess] = useState(false);

  // Teacher Form State
  const [teacherForm, setTeacherForm] = useState({
    name: "", email: "", dateOfBirth: "", employeeId: "", department: "Mathematics",
    qualification: "", phone: "", role: "TEACHER"
  });
  const [teachSaving, setTeachSaving] = useState(false);
  const [teachSuccess, setTeachSuccess] = useState(false);

  // Staff Form State (Admin, Principal, Clerk, Peon, Security Guard)
  const [staffForm, setStaffForm] = useState({
    name: "", email: "", dateOfBirth: "", phone: "", address: "", role: "PRINCIPAL"
  });
  const [staffSaving, setStaffSaving] = useState(false);
  const [staffSuccess, setStaffSuccess] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // Announcement Form State
  const [annForm, setAnnForm] = useState({
    title: "", content: "", targetRole: "ALL", category: "GENERAL", endDate: ""
  });
  const [annSaving, setAnnSaving] = useState(false);
  const [annSuccess, setAnnSuccess] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/admin");
      const data = await res.json();
      if (data.success) {
        setAdminData(data);
        setStudents(data.students);
        setTeachers(data.teachers);
        setBooks(data.books);
        setAnnouncements(data.announcements || []);
        setArchivedAnnouncements(data.archivedAnnouncements || []);
        // Also fetch all users for staff list
        const uRes = await fetch("/api/portal/admin/users");
        const uData = await uRes.json();
        if (uData.success) setAllUsers(uData.users);
      } else {
        setError(data.error || "Failed to load admin logs");
      }
    } catch (err) {
      setError("Network error loading dashboard data");
    } finally {
      setLoading(false);
    }
  }

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setStudSaving(true);
    setStudSuccess(false);

    try {
      const res = await fetch("/api/portal/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentForm.name,
          email: studentForm.email,
          dateOfBirth: studentForm.dateOfBirth,
          role: studentForm.role,
          phone: studentForm.phone,
          address: studentForm.address,
          className: studentForm.className,
          section: studentForm.section,
          rollNumber: studentForm.rollNo,
          admissionNo: `DPS-${Date.now().toString().slice(-6)}`,
          parentName: studentForm.parentName,
          parentPhone: studentForm.phone,
          parentEmail: studentForm.parentEmail,
        })
      });
      const data = await res.json();
      if (data.success) {
        setStudSuccess(true);
        setStudentForm({
          name: "", email: "", dateOfBirth: "", className: "10", section: "A", rollNo: "",
          parentName: "", parentEmail: "", phone: "", address: "", role: "STUDENT"
        });
        fetchAdminData();
      } else {
        alert(data.error || "Failed to register student");
      }
    } catch (err) {
      alert("Error registering student profile");
    } finally {
      setStudSaving(false);
    }
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setTeachSaving(true);
    setTeachSuccess(false);
    try {
      const res = await fetch("/api/portal/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teacherForm.name,
          email: teacherForm.email,
          dateOfBirth: teacherForm.dateOfBirth,
          role: teacherForm.role,
          phone: teacherForm.phone,
          employeeId: teacherForm.employeeId,
          department: teacherForm.department,
          qualification: teacherForm.qualification,
        })
      });
      const data = await res.json();
      if (data.success) {
        setTeachSuccess(true);
        setTeacherForm({ name: "", email: "", dateOfBirth: "", employeeId: "", department: "Mathematics", qualification: "", phone: "", role: "TEACHER" });
        fetchAdminData();
      } else {
        alert(data.error || "Failed to register educator");
      }
    } catch (err) {
      alert("Error registering educator");
    } finally {
      setTeachSaving(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setStaffSaving(true);
    setStaffSuccess(false);
    try {
      const res = await fetch("/api/portal/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffForm)
      });
      const data = await res.json();
      if (data.success) {
        setStaffSuccess(true);
        setStaffForm({ name: "", email: "", dateOfBirth: "", phone: "", address: "", role: "PRINCIPAL" });
        fetchAdminData();
      } else {
        alert(data.error || "Failed to register staff member");
      }
    } catch (err) {
      alert("Error registering staff member");
    } finally {
      setStaffSaving(false);
    }
  };

  const handleAnnounceSubmit = async (e) => {
    e.preventDefault();
    setAnnSaving(true);
    setAnnSuccess(false);

    try {
      const res = await fetch("/api/portal/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...annForm,
          authorId: user?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setAnnSuccess(true);
        setAnnForm({ title: "", content: "", targetRole: "ALL", category: "GENERAL", endDate: "" });
        alert("Announcement broadcast successfully!");
        fetchAdminData();
      } else {
        alert(data.error || "Failed to publish notice");
      }
    } catch (err) {
      alert("Error publishing announcement notice");
    } finally {
      setAnnSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !adminData) {
    return (
      <div className="flex-1 p-8 text-center text-red-500">
        <AlertCircle className="mx-auto w-10 h-10 mb-2" />
        <p className="font-bold">{error || "Failed to initialize admin profile"}</p>
        <button onClick={fetchAdminData} className="mt-4 text-xs font-semibold text-primary underline">Retry</button>
      </div>
    );
  }

  // Visual chart datasets
  const attendanceTrendData = [
    { week: "Wk 1", attendance: 95 },
    { week: "Wk 2", attendance: 96 },
    { week: "Wk 3", attendance: 92 },
    { week: "Wk 4", attendance: 94 },
    { week: "Wk 5", attendance: 95 },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* CONDITIONAL LAYOUTS */}

      {/* 1. DASHBOARD OVERVIEW */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Admin Console</h1>
            <p className="text-xs text-muted-foreground">Global school statistics and system activity logs.</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border p-4 rounded-lg shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-primary/10 rounded-lg text-primary"><Users size={20} /></div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Students</span>
                <h4 className="font-extrabold text-lg leading-tight mt-0.5">{adminData.metrics.studentCount}</h4>
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-primary/10 rounded-lg text-primary"><Users size={20} /></div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Teachers</span>
                <h4 className="font-extrabold text-lg leading-tight mt-0.5">{adminData.metrics.teacherCount}</h4>
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-primary/10 rounded-lg text-primary"><Library size={20} /></div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Library books</span>
                <h4 className="font-extrabold text-lg leading-tight mt-0.5">{adminData.metrics.bookCount}</h4>
              </div>
            </div>
          </div>

          {/* Recharts Analytics & Audit Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart grids */}
            <div className="lg:col-span-8 space-y-6">
              {/* Attendance Trends */}
              <div className="bg-card border rounded-lg p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Avg Attendance Trend (%)</h4>
                <div className="h-56 w-full text-[10px]">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="week" />
                        <YAxis domain={[80, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="attendance" stroke="#0B7A3B" strokeWidth={2.5} name="Rate" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Audit Logs Column */}
            <div className="lg:col-span-4 bg-card border rounded-lg p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Activity size={16} className="text-primary" /> System Logs (Audit Trail)
              </h3>
              
              <div className="space-y-3 text-[11px] text-muted-foreground">
                {adminData.auditLogs.map((log) => (
                  <div key={log.id} className="border-b pb-2.5 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-350">{log.action}</span>
                      <span className="text-[9px] text-slate-400 shrink-0">{log.time}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Triggered by: {log.user}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. STUDENTS REGISTRY */}
      {activeTab === "students" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Students Registry Database</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Student addition form */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/30 border p-5 rounded-lg space-y-4">
              <h3 className="font-bold text-sm">Register New Student</h3>
              
              {studSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded text-xs text-emerald-800 dark:text-emerald-300">
                  Student & Parent registered. DB records committed.
                </div>
              )}

              <form onSubmit={handleStudentSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Student Full Name</label>
                  <input
                    type="text" required value={studentForm.name}
                    onChange={(e) => { setStudentForm({ ...studentForm, name: e.target.value }); setStudSuccess(false); }}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    placeholder="Student name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Assigned Role</label>
                  <select
                    value={studentForm.role}
                    onChange={(e) => setStudentForm({ ...studentForm, role: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="ALUMNI">Alumni</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Class Block</label>
                    <input
                      type="text" required value={studentForm.className}
                      onChange={(e) => setStudentForm({ ...studentForm, className: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Section</label>
                    <input
                      type="text" required value={studentForm.section}
                      onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Roll No</label>
                    <input
                      type="number" required value={studentForm.rollNo}
                      onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Student Email</label>
                    <input
                      type="email" required value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                      placeholder="stud@dpsdamanjodi.edu.in"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Date of Birth
                    <span className="ml-1 text-primary font-normal">(used for password)</span>
                  </label>
                  <input
                    type="date" required value={studentForm.dateOfBirth}
                    onChange={(e) => setStudentForm({ ...studentForm, dateOfBirth: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                  />
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-2.5 rounded text-[10px] text-green-700 dark:text-green-400">
                  🔑 Password will be: <span className="font-mono font-bold">{studentForm.email ? studentForm.email.split("@")[0] : "username"}@{studentForm.dateOfBirth ? studentForm.dateOfBirth.split("-").reverse().join("").slice(0,8) : "DDMMYYYY"}</span>
                </div>

                <div className="border-t border-slate-300 dark:border-slate-700 my-2 pt-2"></div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Parent / Guardian Name</label>
                  <input
                    type="text" required value={studentForm.parentName}
                    onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Parent Email</label>
                    <input
                      type="email" required value={studentForm.parentEmail}
                      onChange={(e) => setStudentForm({ ...studentForm, parentEmail: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Parent Phone</label>
                    <input
                      type="tel" required value={studentForm.phone}
                      onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={studSaving}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded font-bold text-xs shadow transition-colors cursor-pointer mt-2"
                >
                  {studSaving ? "Registering..." : "Register Student"}
                </button>
              </form>
            </div>

            {/* Students List Table */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-bold text-sm">Active Students list</h3>
              
              <div className="overflow-x-auto border rounded-lg bg-card text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-2.5">Adm No</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Class-Sec</th>
                      <th className="p-2.5">Roll No</th>
                      <th className="p-2.5">Parent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-muted-foreground">
                    {students.map((stud) => (
                      <tr key={stud.id}>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{stud.admissionNo}</td>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{stud.user.name}</td>
                        <td className="p-2.5">{stud.class}-{stud.section}</td>
                        <td className="p-2.5 font-semibold">{stud.rollNo}</td>
                        <td className="p-2.5">{stud.parent.user.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TEACHERS REGISTRY */}
      {activeTab === "teachers" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Teachers Registry Database</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/30 border p-5 rounded-lg space-y-4">
              <h3 className="font-bold text-sm">Register New Educator</h3>
              
              {teachSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded text-xs text-emerald-800 dark:text-emerald-300">
                  Teacher registered. Credentials issued.
                </div>
              )}

              <form onSubmit={handleTeacherSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Educator Name</label>
                  <input
                    type="text" required value={teacherForm.name}
                    onChange={(e) => { setTeacherForm({ ...teacherForm, name: e.target.value }); setTeachSuccess(false); }}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    placeholder="Educator full name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Email Address</label>
                  <input
                    type="email" required value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    placeholder="teach@dpsdamanjodi.edu.in"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Date of Birth</label>
                  <input
                    type="date" required value={teacherForm.dateOfBirth}
                    onChange={(e) => setTeacherForm({ ...teacherForm, dateOfBirth: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Employee ID</label>
                    <input
                      type="text" required value={teacherForm.employeeId}
                      onChange={(e) => setTeacherForm({ ...teacherForm, employeeId: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                      placeholder="e.g. DPS-T-104"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Department</label>
                    <select
                      value={teacherForm.department}
                      onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    >
                      {["Mathematics", "Science", "English", "Social Studies", "Odia", "Computer Science", "Administration"].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Qualifications</label>
                  <input
                    type="text" required value={teacherForm.qualification}
                    onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    placeholder="e.g. M.Sc, B.Ed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Phone</label>
                  <input
                    type="tel" required value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                  />
                </div>


                <button
                  type="submit"
                  disabled={teachSaving}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded font-bold text-xs shadow transition-colors cursor-pointer mt-2"
                >
                  {teachSaving ? "Registering..." : "Register Teacher"}
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-bold text-sm">Active Educators</h3>
              <div className="overflow-x-auto border rounded-lg bg-card text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-2.5">Emp ID</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Department</th>
                      <th className="p-2.5">Qualification</th>
                      <th className="p-2.5">Homeroom</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-muted-foreground">
                    {teachers.map((teach) => (
                      <tr key={teach.id}>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{teach.employeeId}</td>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{teach.user.name}</td>
                        <td className="p-2.5 font-semibold text-primary">{teach.department}</td>
                        <td className="p-2.5">{teach.qualification}</td>
                        <td className="p-2.5">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAFF REGISTRY: Admin, Principal, Clerk, Peon, Security Guard */}
      {activeTab === "staff" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Staff Registry</h2>
          <p className="text-xs text-muted-foreground -mt-4">Register Admin, Principal, Clerk, Peon, and Security Guard accounts.</p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Staff Form */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/30 border p-5 rounded-lg space-y-4">
              <h3 className="font-bold text-sm">Register Staff Member</h3>

              {staffSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 p-4 rounded text-xs text-emerald-800 dark:text-emerald-300">
                  ✅ Staff member registered. Credentials issued.
                </div>
              )}

              <form onSubmit={handleStaffSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Role</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="PRINCIPAL">Principal</option>
                    <option value="CLERK">Clerk</option>
                    <option value="PEON">Peon</option>
                    <option value="SECURITY_GUARD">Security Guard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Full Name</label>
                  <input
                    type="text" required value={staffForm.name}
                    onChange={(e) => { setStaffForm({ ...staffForm, name: e.target.value }); setStaffSuccess(false); }}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    placeholder="Full name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Email Address</label>
                  <input
                    type="email" required value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    placeholder="staff@dpsdamanjodi.edu.in"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Date of Birth
                    <span className="ml-1 text-primary font-normal">(used for password)</span>
                  </label>
                  <input
                    type="date" required value={staffForm.dateOfBirth}
                    onChange={(e) => setStaffForm({ ...staffForm, dateOfBirth: e.target.value })}
                    className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Phone</label>
                    <input
                      type="tel" value={staffForm.phone}
                      onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Address</label>
                    <input
                      type="text" value={staffForm.address}
                      onChange={(e) => setStaffForm({ ...staffForm, address: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    />
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-2.5 rounded text-[10px] text-green-700 dark:text-green-400">
                  🔑 Password will be: <span className="font-mono font-bold">{staffForm.email ? staffForm.email.split("@")[0] : "username"}@{staffForm.dateOfBirth ? staffForm.dateOfBirth.split("-").reverse().join("").slice(0,8) : "DDMMYYYY"}</span>
                </div>

                <button
                  type="submit"
                  disabled={staffSaving}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded font-bold text-xs shadow transition-colors cursor-pointer mt-2"
                >
                  {staffSaving ? "Registering..." : "Register Staff Member"}
                </button>
              </form>
            </div>

            {/* Staff list */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-bold text-sm">All Non-Student Staff</h3>
              <div className="overflow-x-auto border rounded-lg bg-card text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Role</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-muted-foreground">
                    {allUsers
                      .filter((u) => !["STUDENT"].includes(u.role))
                      .map((u) => (
                        <tr key={u.id}>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{u.name}</td>
                          <td className="p-2.5 font-mono text-[10px]">{u.email}</td>
                          <td className="p-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              u.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                              u.role === "PRINCIPAL" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                              u.role === "TEACHER" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                              u.role === "CLERK" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                              "bg-slate-100 text-slate-600"
                            }`}>{u.role.replace("_", " ")}</span>
                          </td>
                          <td className="p-2.5">
                            <span className={`text-[9px] font-bold ${ u.isActive ? "text-emerald-600" : "text-red-500" }`}>
                              {u.isActive ? "Active" : "Inactive"}
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

      {/* 4. LIBRARY CATALOG */}
      {activeTab === "library" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Library Inventory Management</h2>
          
          <div className="overflow-x-auto border rounded-lg bg-card text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-2.5">ISBN</th>
                  <th className="p-2.5">Book Title</th>
                  <th className="p-2.5">Author</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Shelf Location</th>
                  <th className="p-2.5 text-right">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y text-muted-foreground">
                {books.map((book) => (
                  <tr key={book.id}>
                    <td className="p-2.5 font-mono">{book.isbn}</td>
                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">{book.title}</td>
                    <td className="p-2.5">{book.author}</td>
                    <td className="p-2.5">{book.category}</td>
                    <td className="p-2.5">{book.location}</td>
                    <td className="p-2.5 text-right font-bold text-primary">
                      {book.availableCopies} / {book.totalCopies} Copies
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* 6. ANNOUNCEMENTS BROADCAST */}
      {activeTab === "announcements" && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          {/* Broadcast Form Panel */}
          <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-bold">Broadcast Notices Ingest Panel</h2>
              <p className="text-xs text-muted-foreground font-semibold">Publish announcements directly to portals notice boards.</p>
            </div>

            <form onSubmit={handleAnnounceSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Target Role</label>
                  <select
                    value={annForm.targetRole}
                    onChange={(e) => setAnnForm({ ...annForm, targetRole: e.target.value })}
                    className="w-full border rounded p-2.5 focus:ring focus:outline-none bg-background text-xs sm:text-sm"
                  >
                    <option value="ALL">Everyone (Public & Portal)</option>
                    <option value="STUDENT">Students Only</option>
                    <option value="TEACHER">Teachers Only</option>
                    <option value="PARENT">Parents Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Notice Category</label>
                  <select
                    value={annForm.category}
                    onChange={(e) => setAnnForm({ ...annForm, category: e.target.value })}
                    className="w-full border rounded p-2.5 focus:ring focus:outline-none bg-background text-xs sm:text-sm"
                  >
                    <option value="GENERAL">General Notice</option>
                    <option value="ACADEMIC">Academic / Exams</option>
                    <option value="EVENT">Cultural / Events</option>
                    <option value="URGENT">Urgent Warning</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">End Date / Expiration (Optional)</label>
                  <input
                    type="datetime-local"
                    value={annForm.endDate}
                    onChange={(e) => setAnnForm({ ...annForm, endDate: e.target.value })}
                    className="w-full border rounded p-2.5 focus:ring focus:outline-none bg-background text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Announcement Title</label>
                <input
                  type="text" required value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="w-full border rounded p-2.5 focus:ring focus:outline-none bg-background text-xs sm:text-sm"
                  placeholder="e.g. Rescheduling of Summer Breaks"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Notice Content Details</label>
                <textarea
                  required rows={5} value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  className="w-full border rounded p-2.5 focus:ring focus:outline-none bg-background text-xs sm:text-sm"
                  placeholder="Enter details of announcement..."
                />
              </div>

              <button
                type="submit"
                disabled={annSaving}
                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded font-bold text-xs shadow transition-colors cursor-pointer"
              >
                {annSaving ? "Broadcasting..." : "Broadcast Notice"}
              </button>
            </form>
          </div>

          {/* Bulletins & Notices Board */}
          <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Bell size={16} className="text-primary" />
                Notices Board
              </h3>
              
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

            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {(announcementsTab === "active" ? announcements : archivedAnnouncements).length > 0 ? (
                (announcementsTab === "active" ? announcements : archivedAnnouncements).map((notice) => (
                  <div key={notice.id} className="border-b border-slate-100 dark:border-slate-850 pb-3 last:border-0 last:pb-0 flex items-start gap-4 text-left">
                    <div className="bg-slate-50 border dark:bg-slate-900/50 p-2 rounded text-center shrink-0 w-12 h-12 flex flex-col justify-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">
                        {new Date(notice.date).toLocaleString("default", { month: "short" })}
                      </span>
                      <span className="text-sm font-bold text-primary mt-0.5 leading-none">
                        {new Date(notice.date).getDate()}
                      </span>
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          notice.category === "URGENT" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {notice.category}
                        </span>
                        <span className="text-[10px] text-slate-400">Audience: {notice.targetRole === "ALL" ? "Everyone" : notice.targetRole}</span>
                        {notice.endDate && (
                          <span className="text-[9px] border dark:border-slate-800 rounded px-1 text-slate-500 dark:text-slate-400 font-medium">
                            {announcementsTab === "active" ? "Expires: " : "Expired: "}
                            {new Date(notice.endDate).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-150 leading-tight">{notice.title}</h4>
                      <p className="text-xs text-muted-foreground leading-normal whitespace-pre-wrap">{notice.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  {announcementsTab === "active" ? "No notices currently active." : "Archive folder is empty."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AdminDashboardContent />
    </React.Suspense>
  );
}
