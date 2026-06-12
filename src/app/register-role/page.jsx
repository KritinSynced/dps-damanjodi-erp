"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DPSLogo from "@/components/ui/DPSLogo";
import { User, Shield, GraduationCap, Users, ArrowRight, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

function InteractiveParticles() {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 100;
    const attractionRadius = 180;
    const attractionForce = 0.04;

    const mouse = {
      x: null,
      y: null,
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.baseRadius = Math.random() * 2 + 1.5;
        this.radius = this.baseRadius;
        const greens = ["#0B7A3B", "#10B981", "#059669", "#34D399"];
        this.color = greens[Math.floor(Math.random() * greens.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < attractionRadius) {
            this.x += (dx / distance) * (attractionRadius - distance) * attractionForce;
            this.y += (dy / distance) * (attractionRadius - distance) * attractionForce;
            this.radius = this.baseRadius * 1.4;
          } else {
            this.radius = this.baseRadius;
          }
        } else {
          this.radius = this.baseRadius;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(11, 122, 91, ${0.12 * (1 - distance / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ display: "block" }}
    />
  );
}

export default function RegisterRolePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [googleData, setGoogleData] = useState(null);
  const [selectedRole, setSelectedRole] = useState(""); // STUDENT, PARENT, TEACHER, ADMIN
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    adminKey: "",
    adminUsername: ""
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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
        setError(data.error || data.detail || "Failed to complete registration");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Server connection error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      <InteractiveParticles />

      <div className="max-w-2xl mx-auto w-full space-y-6 z-10">
        <div className="flex justify-center mb-4">
          <img
            src="/logo-banner.png"
            alt="Delhi Public School Damanjodi Logo"
            className="w-full max-w-[340px] h-auto object-contain rounded-lg shadow-sm border border-slate-200/50 bg-white p-1"
          />
        </div>

        {/* User Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-4 shadow-md text-slate-800">
          <img src={googleData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${googleData.name}`} alt={googleData.name} className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50" />
          <div>
            <h4 className="font-bold text-sm text-slate-800">
              {googleData.name === "Clerk User" || googleData.name === "New User" ? googleData.email : googleData.name}
            </h4>
            {googleData.name !== "Clerk User" && googleData.name !== "New User" && (
              <p className="text-xs text-slate-500 font-mono mt-0.5">{googleData.email}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-3 text-xs text-red-700">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Multi-step Container */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">
          {!selectedRole ? (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Select Your Portal Role</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole("STUDENT")}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-primary p-5 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer group flex items-start gap-4"
                >
                  <GraduationCap className="text-primary group-hover:scale-110 transition-transform w-8 h-8 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Student</h4>
                    <p className="text-[11px] text-slate-550 mt-1 leading-normal">Track attendance, view report cards, check assignments, and apply for leaves.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("PARENT")}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-primary p-5 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer group flex items-start gap-4"
                >
                  <Users className="text-primary group-hover:scale-110 transition-transform w-8 h-8 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Parent</h4>
                    <p className="text-[11px] text-slate-550 mt-1 leading-normal">Monitor your child&apos;s records, check grade progress, and contact teachers.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("TEACHER")}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-primary p-5 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer group flex items-start gap-4"
                >
                  <User className="text-primary group-hover:scale-110 transition-transform w-8 h-8 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Teacher</h4>
                    <p className="text-[11px] text-slate-550 mt-1 leading-normal">Manage class registers, submit marks sheet, upload homework, and approve leaves.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("ADMIN")}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-primary p-5 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer group flex items-start gap-4"
                >
                  <Shield className="text-primary group-hover:scale-110 transition-transform w-8 h-8 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Administrator</h4>
                    <p className="text-[11px] text-slate-550 mt-1 leading-normal">Register students and teachers, configure classes, and post announcements.</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-slate-700">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => { setSelectedRole(""); setError(""); }}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-550 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to roles
                </button>
                <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-bold uppercase shrink-0">
                  {selectedRole} Profile
                </span>
              </div>

              {/* Dynamic Forms */}
              {selectedRole === "STUDENT" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Admission Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DPS-2026-9876"
                      value={studentFields.admissionNo}
                      onChange={(e) => setStudentFields({ ...studentFields, admissionNo: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Class Block</label>
                    <select
                      value={studentFields.className}
                      onChange={(e) => setStudentFields({ ...studentFields, className: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    >
                      {["Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class X", "Class XI", "Class XII"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Section</label>
                    <select
                      value={studentFields.section}
                      onChange={(e) => setStudentFields({ ...studentFields, section: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    >
                      {["A", "B", "C", "D"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Roll Number</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 15"
                      value={studentFields.rollNo}
                      onChange={(e) => setStudentFields({ ...studentFields, rollNo: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={studentFields.dateOfBirth}
                      onChange={(e) => setStudentFields({ ...studentFields, dateOfBirth: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Gender</label>
                    <select
                      value={studentFields.gender}
                      onChange={(e) => setStudentFields({ ...studentFields, gender: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={studentFields.phone}
                      onChange={(e) => setStudentFields({ ...studentFields, phone: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Parent Registered Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. parent@dpsdamanjodi.edu.in"
                      value={studentFields.parentEmail}
                      onChange={(e) => setStudentFields({ ...studentFields, parentEmail: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Residential Address</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Full residential details..."
                      value={studentFields.address}
                      onChange={(e) => setStudentFields({ ...studentFields, address: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRole === "PARENT" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Occupation</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Service, Business"
                      value={parentFields.occupation}
                      onChange={(e) => setParentFields({ ...parentFields, occupation: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Relationship</label>
                    <select
                      value={parentFields.relation}
                      onChange={(e) => setParentFields({ ...parentFields, relation: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    >
                      <option value="FATHER">Father</option>
                      <option value="MOTHER">Mother</option>
                      <option value="GUARDIAN">Guardian</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={parentFields.phone}
                      onChange={(e) => setParentFields({ ...parentFields, phone: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Child&apos;s Admission Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DPS-2026-1234"
                      value={parentFields.studentAdmissionNo}
                      onChange={(e) => setParentFields({ ...parentFields, studentAdmissionNo: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Residential Address</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Full residential details..."
                      value={parentFields.address}
                      onChange={(e) => setParentFields({ ...parentFields, address: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRole === "TEACHER" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Employee ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EMP-9876"
                      value={teacherFields.employeeId}
                      onChange={(e) => setTeacherFields({ ...teacherFields, employeeId: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Department</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mathematics, Science"
                      value={teacherFields.department}
                      onChange={(e) => setTeacherFields({ ...teacherFields, department: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Professional Qualification</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. M.Sc, B.Ed"
                      value={teacherFields.qualification}
                      onChange={(e) => setTeacherFields({ ...teacherFields, qualification: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={teacherFields.phone}
                      onChange={(e) => setTeacherFields({ ...teacherFields, phone: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRole === "ADMIN" && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Choose Admin Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. sahu_admin"
                      value={adminFields.adminUsername}
                      onChange={(e) => setAdminFields({ ...adminFields, adminUsername: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Admin Access Key</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter the secure admin key"
                      value={adminFields.adminKey}
                      onChange={(e) => setAdminFields({ ...adminFields, adminKey: e.target.value })}
                      className="w-full border border-slate-200 rounded bg-white p-2.5 text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

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
