"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DPSLogo from "@/components/ui/DPSLogo";
import { User, Shield, GraduationCap, Users, ArrowRight, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function RegisterRolePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [googleData, setGoogleData] = useState(null);
  const [selectedRole, setSelectedRole] = useState(""); // STUDENT, PARENT, TEACHER, ADMIN
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  // Role-specific fields
  const [studentFields, setStudentFields] = useState({
    admissionNo: "",
    className: "Class X",
    section: "A",
    rollNo: "",
    dateOfBirth: "",
    gender: "Male",
    phone: "",
    address: "",
    parentEmail: ""
  });

  const [parentFields, setParentFields] = useState({
    occupation: "",
    relation: "FATHER",
    phone: "",
    address: "",
    studentAdmissionNo: ""
  });

  const [teacherFields, setTeacherFields] = useState({
    employeeId: "",
    department: "",
    qualification: "",
    phone: ""
  });

  const [adminFields, setAdminFields] = useState({
    adminKey: ""
  });

  useEffect(() => {
    // If already logged in completely, redirect to dashboard
    if (user) {
      router.push(`/portal/${user.role.toLowerCase()}`);
      return;
    }

    // Load Google temporary registration data
    const raw = sessionStorage.getItem("dps_temp_google_auth");
    if (!raw) {
      router.push("/login");
      return;
    }

    try {
      setGoogleData(JSON.parse(raw));
    } catch (e) {
      router.push("/login");
    }
  }, [user, router]);

  if (!googleData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    let additionalData = {};
    if (selectedRole === "STUDENT") {
      additionalData = { ...studentFields };
    } else if (selectedRole === "PARENT") {
      additionalData = { ...parentFields };
    } else if (selectedRole === "TEACHER") {
      additionalData = { ...teacherFields };
    } else if (selectedRole === "ADMIN") {
      additionalData = { ...adminFields };
    }

    try {
      const response = await fetch("/api/auth/register-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          googleId: googleData.googleId,
          email: googleData.email,
          name: googleData.name,
          avatar: googleData.avatar,
          password,
          additionalData
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Complete login
        localStorage.setItem("dps_session", JSON.stringify(data.user));
        localStorage.setItem("dps_token", data.token);
        
        // Clean session temp data
        sessionStorage.removeItem("dps_temp_google_auth");
        
        // Redirect to dashboard
        router.push(`/portal/${selectedRole.toLowerCase()}`);
      } else {
        setError(data.error || "Failed to complete registration");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Server connection error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0B7A3B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="max-w-2xl mx-auto w-full space-y-6 z-10">
        <div className="text-center">
          <DPSLogo size={56} className="mx-auto" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Complete Registration</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Link your Google account with a school portal profile.
          </p>
        </div>

        {/* User Card */}
        <div className="bg-slate-800 border border-slate-700/80 rounded-xl p-4 flex items-center gap-4 shadow-lg">
          <img src={googleData.avatar} alt={googleData.name} className="w-12 h-12 rounded-full border border-slate-600" />
          <div>
            <h4 className="font-bold text-sm text-slate-200">{googleData.name}</h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{googleData.email}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-lg flex items-center gap-3 text-xs text-red-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Multi-step Container */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 backdrop-blur-sm">
          {!selectedRole ? (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest text-center">Select Your Portal Role</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole("STUDENT")}
                  className="bg-slate-900/50 hover:bg-slate-900 border border-slate-700 hover:border-primary p-5 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer group flex items-start gap-4"
                >
                  <GraduationCap className="text-primary group-hover:scale-110 transition-transform w-8 h-8 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Student</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">Track attendance, view report cards, check assignments, and apply for leaves.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("PARENT")}
                  className="bg-slate-900/50 hover:bg-slate-900 border border-slate-700 hover:border-primary p-5 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer group flex items-start gap-4"
                >
                  <Users className="text-primary group-hover:scale-110 transition-transform w-8 h-8 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Parent</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">Monitor your child&apos;s records, check grade progress, and contact teachers.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("TEACHER")}
                  className="bg-slate-900/50 hover:bg-slate-900 border border-slate-700 hover:border-primary p-5 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer group flex items-start gap-4"
                >
                  <User className="text-primary group-hover:scale-110 transition-transform w-8 h-8 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Teacher</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">Manage class registers, submit marks sheet, upload homework, and approve leaves.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("ADMIN")}
                  className="bg-slate-900/50 hover:bg-slate-900 border border-slate-700 hover:border-primary p-5 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer group flex items-start gap-4"
                >
                  <Shield className="text-primary group-hover:scale-110 transition-transform w-8 h-8 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Administrator</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">Register students and teachers, configure classes, and post announcements.</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <button
                  type="button"
                  onClick={() => { setSelectedRole(""); setError(""); }}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to roles
                </button>
                <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full font-bold uppercase shrink-0">
                  {selectedRole} Profile
                </span>
              </div>

              {/* Dynamic Forms */}
              {selectedRole === "STUDENT" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Admission Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DPS-2026-9876"
                      value={studentFields.admissionNo}
                      onChange={(e) => setStudentFields({ ...studentFields, admissionNo: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Class Block</label>
                    <select
                      value={studentFields.className}
                      onChange={(e) => setStudentFields({ ...studentFields, className: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    >
                      {["Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class X", "Class XI", "Class XII"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Section</label>
                    <select
                      value={studentFields.section}
                      onChange={(e) => setStudentFields({ ...studentFields, section: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    >
                      {["A", "B", "C", "D"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Roll Number</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 15"
                      value={studentFields.rollNo}
                      onChange={(e) => setStudentFields({ ...studentFields, rollNo: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={studentFields.dateOfBirth}
                      onChange={(e) => setStudentFields({ ...studentFields, dateOfBirth: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Gender</label>
                    <select
                      value={studentFields.gender}
                      onChange={(e) => setStudentFields({ ...studentFields, gender: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={studentFields.phone}
                      onChange={(e) => setStudentFields({ ...studentFields, phone: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Parent Registered Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. parent@dpsdamanjodi.edu.in"
                      value={studentFields.parentEmail}
                      onChange={(e) => setStudentFields({ ...studentFields, parentEmail: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Residential Address</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Full residential details..."
                      value={studentFields.address}
                      onChange={(e) => setStudentFields({ ...studentFields, address: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-255 focus:ring focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRole === "PARENT" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Occupation</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Service, Business"
                      value={parentFields.occupation}
                      onChange={(e) => setParentFields({ ...parentFields, occupation: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Relationship</label>
                    <select
                      value={parentFields.relation}
                      onChange={(e) => setParentFields({ ...parentFields, relation: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    >
                      <option value="FATHER">Father</option>
                      <option value="MOTHER">Mother</option>
                      <option value="GUARDIAN">Guardian</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={parentFields.phone}
                      onChange={(e) => setParentFields({ ...parentFields, phone: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Child&apos;s Admission Number (To link profile)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DPS-2026-1234"
                      value={parentFields.studentAdmissionNo}
                      onChange={(e) => setParentFields({ ...parentFields, studentAdmissionNo: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Residential Address</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Full residential details..."
                      value={parentFields.address}
                      onChange={(e) => setParentFields({ ...parentFields, address: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-255 focus:ring focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRole === "TEACHER" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Employee ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EMP-9876"
                      value={teacherFields.employeeId}
                      onChange={(e) => setTeacherFields({ ...teacherFields, employeeId: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Department</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mathematics, Science"
                      value={teacherFields.department}
                      onChange={(e) => setTeacherFields({ ...teacherFields, department: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Professional Qualification</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. M.Sc, B.Ed"
                      value={teacherFields.qualification}
                      onChange={(e) => setTeacherFields({ ...teacherFields, qualification: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={teacherFields.phone}
                      onChange={(e) => setTeacherFields({ ...teacherFields, phone: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRole === "ADMIN" && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase tracking-wider block">Admin Access Verification Key</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter the secure admin key"
                      value={adminFields.adminKey}
                      onChange={(e) => setAdminFields({ ...adminFields, adminKey: e.target.value })}
                      className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                    />
                  </div>
                </div>
              )}
              {/* Custom Password Field */}
              <div className="space-y-1 text-xs pt-4 border-t border-slate-700/50">
                <label className="font-bold text-slate-400 uppercase tracking-wider block">Create Account Password</label>
                <input
                  type="password"
                  required
                  placeholder="Create a password for direct login later"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-700 rounded bg-slate-900/50 p-2.5 text-slate-250 focus:ring focus:outline-none"
                />
                <span className="text-[10px] text-slate-450 mt-1 block">This will allow you to log in directly using your Name or Email next time.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Registering Portal Profile...
                  </>
                ) : (
                  <>
                    Complete & Login
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
