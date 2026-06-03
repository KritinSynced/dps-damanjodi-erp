"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, UserPlus, CreditCard, Bus, BookOpen, 
  Bell, FileText, CheckCircle2, AlertCircle, Plus,
  ShieldCheck, Lock, Activity, Library
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

function AdminDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [adminData, setAdminData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Lists state
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    name: "", email: "", className: "10", section: "A", rollNo: "",
    parentName: "", parentEmail: "", phone: "", address: ""
  });
  const [studSaving, setStudSaving] = useState(false);
  const [studSuccess, setStudSuccess] = useState(false);

  // Teacher Form State
  const [teacherForm, setTeacherForm] = useState({
    name: "", email: "", employeeId: "", department: "Mathematics",
    qualification: "", phone: "", classTeacherOfClass: "", classTeacherOfSection: ""
  });
  const [teachSaving, setTeachSaving] = useState(false);
  const [teachSuccess, setTeachSuccess] = useState(false);

  // Announcement Form State
  const [annForm, setAnnForm] = useState({
    title: "", content: "", targetRole: "ALL", category: "GENERAL"
  });
  const [annSaving, setAnnSaving] = useState(false);
  const [annSuccess, setAnnSuccess] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/admin");
      const data = await res.json();
      if (data.success) {
        setAdminData(data);
        setStudents(data.students);
        setTeachers(data.teachers);
        setBooks(data.books);
        setRoutes(data.routes);
      } else {
        setError(data.error || "Failed to load admin logs");
      }
    } catch (err) {
      setError("Network error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudSaving(true);
    setStudSuccess(false);

    try {
      const res = await fetch("/api/portal/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      if (data.success) {
        setStudSuccess(true);
        setStudentForm({
          name: "", email: "", className: "10", section: "A", rollNo: "",
          parentName: "", parentEmail: "", phone: "", address: ""
        });
        fetchAdminData(); // Reload registry list
      } else {
        alert(data.error || "Failed to register student");
      }
    } catch (err) {
      alert("Error registering student profile");
    } finally {
      setStudSaving(false);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeachSaving(true);
    setTeachSuccess(false);

    try {
      const res = await fetch("/api/portal/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherForm)
      });
      const data = await res.json();
      if (data.success) {
        setTeachSuccess(true);
        setTeacherForm({
          name: "", email: "", employeeId: "", department: "Mathematics",
          qualification: "", phone: "", classTeacherOfClass: "", classTeacherOfSection: ""
        });
        fetchAdminData(); // Reload registry list
      } else {
        alert(data.error || "Failed to register teacher");
      }
    } catch (err) {
      alert("Error registering teacher profile");
    } finally {
      setTeachSaving(false);
    }
  };

  const handleAnnounceSubmit = async (e: React.FormEvent) => {
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
        setAnnForm({ title: "", content: "", targetRole: "ALL", category: "GENERAL" });
        alert("Announcement broadcast successfully!");
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
  const feeCollectionsData = [
    { name: "Apr (Q1)", collection: 62000, target: 80000 },
    { name: "Jul (Q2)", collection: 45000, target: 80000 },
    { name: "Oct (Q3)", collection: 58000, target: 80000 },
    { name: "Jan (Q4)", collection: 18900, target: 80000 },
  ];

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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="p-3 bg-primary/10 rounded-lg text-primary"><Bus size={20} /></div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Buses</span>
                <h4 className="font-extrabold text-lg leading-tight mt-0.5">{adminData.metrics.routeCount}</h4>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fee Collections */}
                <div className="bg-card border rounded-lg p-5 shadow-sm space-y-3">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Fee Collection (₹)</h4>
                  <div className="h-56 w-full text-[10px]">
                    {isMounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={feeCollectionsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="collection" fill="#0B7A3B" radius={[4, 4, 0, 0]} name="Received" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

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
            </div>

            {/* Audit Logs Column */}
            <div className="lg:col-span-4 bg-card border rounded-lg p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Activity size={16} className="text-primary" /> System Logs (Audit Trail)
              </h3>
              
              <div className="space-y-3 text-[11px] text-muted-foreground">
                {adminData.auditLogs.map((log: any) => (
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
                      {["Mathematics", "Science", "English", "Social Studies", "Odia", "Computer Science"].map((d) => (
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

                <div className="grid grid-cols-2 gap-2">
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
                    <label className="font-bold text-slate-400">Telephone Line</label>
                    <input
                      type="tel" required value={teacherForm.phone}
                      onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Homeroom Class</label>
                    <input
                      type="text" value={teacherForm.classTeacherOfClass}
                      onChange={(e) => setTeacherForm({ ...teacherForm, classTeacherOfClass: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                      placeholder="e.g. 10 (Optional)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Homeroom Sec</label>
                    <input
                      type="text" value={teacherForm.classTeacherOfSection}
                      onChange={(e) => setTeacherForm({ ...teacherForm, classTeacherOfSection: e.target.value })}
                      className="w-full border rounded p-2 focus:ring focus:outline-none bg-background"
                      placeholder="e.g. A (Optional)"
                    />
                  </div>
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
                        <td className="p-2.5">{teach.classTeacherOfClass ? `${teach.classTeacherOfClass}-${teach.classTeacherOfSection}` : "—"}</td>
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

      {/* 5. TRANSPORT ROUTES */}
      {activeTab === "transport" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold">Bus Route Schedules</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routes.map((rt) => (
              <div key={rt.id} className="border p-5 rounded-lg shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><Bus size={20} /></div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">{rt.routeName}</h3>
                    <span className="text-[10px] font-bold text-slate-400 font-mono block">{rt.vehicleNo}</span>
                  </div>
                </div>
                
                <div className="border-t pt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div><strong>Driver:</strong> {rt.driverName}</div>
                  <div><strong>Driver Contact:</strong> {rt.driverPhone}</div>
                  <div>
                    <strong>Route Stops:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {JSON.parse(rt.stops).map((s: any, i: number) => (
                        <span key={i} className="text-[9px] bg-slate-50 border px-1.5 py-0.5 rounded">
                          {s.name} ({s.time})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ANNOUNCEMENTS BROADCAST */}
      {activeTab === "announcements" && (
        <div className="max-w-2xl mx-auto bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold">Broadcast Notices Ingest Panel</h2>
            <p className="text-xs text-muted-foreground font-semibold">Publish announcements directly to portals notice boards.</p>
          </div>

          <form onSubmit={handleAnnounceSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-4">
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
