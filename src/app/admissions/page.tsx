"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { CheckCircle2, AlertCircle, FileText, ClipboardList, CreditCard, Search, ArrowRight } from "lucide-react";

export default function AdmissionsPage() {
  const [activeTab, setActiveTab] = useState<"process" | "apply" | "fees" | "track">("process");
  
  // Apply Form State
  const [formData, setFormData] = useState({
    studentName: "",
    dob: "",
    gender: "",
    className: "Nursery",
    parentName: "",
    phone: "",
    email: "",
    address: "",
    prevSchool: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);

  // Tracking State
  const [searchId, setSearchId] = useState("");
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState("");

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API registration call
    setTimeout(() => {
      const generatedId = `DPS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setAppId(generatedId);
      setIsSubmitting(false);
      
      // Store in memory for immediate tracking demo
      sessionStorage.setItem(generatedId, JSON.stringify({
        studentName: formData.studentName,
        className: formData.className,
        status: "Application Received",
        date: new Date().toLocaleDateString(),
        step: 1
      }));
    }, 1500);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    setTrackingResult(null);

    if (!searchId.trim()) {
      setSearchError("Please enter a valid Application ID");
      return;
    }

    const saved = sessionStorage.getItem(searchId.toUpperCase().trim());
    if (saved) {
      setTrackingResult(JSON.parse(saved));
    } else {
      // Return a realistic mock result for sample IDs
      if (searchId.toUpperCase().trim() === "DPS-2026-1015") {
        setTrackingResult({
          studentName: "Rahul Mohanty",
          className: "Class X",
          status: "Interview Scheduled",
          date: "14-June-2026 09:30 AM",
          step: 2
        });
      } else {
        setSearchError("Application ID not found. Try entering the code returned by the online form or 'DPS-2026-1015'");
      }
    }
  };

  return (
    <>
      <Navbar />
      
      {/* Banner */}
      <section className="bg-slate-950 py-16 text-center text-white relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0B7A3B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Admissions 2026 - 27</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Secure your child&apos;s educational path. Apply online, download guides, check fee schedules, and track progress.
          </p>
        </div>
      </section>

      {/* Tabs Switcher */}
      <section className="py-12 bg-slate-50 dark:bg-slate-900/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap border-b border-muted gap-2">
            <button
              onClick={() => setActiveTab("process")}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "process"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ClipboardList size={16} /> Admission Process
            </button>
            <button
              onClick={() => setActiveTab("apply")}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "apply"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText size={16} /> Online Application Form
            </button>
            <button
              onClick={() => setActiveTab("fees")}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "fees"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <CreditCard size={16} /> Fee Structure
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "track"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search size={16} /> Track Application
            </button>
          </div>

          <div className="py-8">
            {/* TAB 1: PROCESS */}
            {activeTab === "process" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-6">
                  <h2 className="text-xl font-bold">Step-by-Step Admissions Procedure</h2>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="bg-primary text-white w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-sm">1</div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm">Submit Online Registration</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Fill out the details in the Online Form tab. Note down the Application ID generated upon success. Keep copies of required files.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-primary text-white w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-sm">2</div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm">Interaction / Entrance Test</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          For Nursery/KG classes, a brief interactive play meeting is scheduled. For Class I and above, a basic aptitude assessment (English, Math, Science) will be conducted.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-primary text-white w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-sm">3</div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm">Document Verification</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Upon test clearance, parent must present the original Birth Certificate, Transfer Certificate (TC) from the previous school, and Aadhaar card at the administration office.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-primary text-white w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-sm">4</div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm">Fee Payment & Confirmation</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Complete payment of the admission fee and first quarter dues online or via draft. A student registration number and class block are assigned thereafter.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-card border p-6 rounded-lg shadow-sm space-y-6">
                  <h3 className="font-bold text-base flex items-center gap-1.5"><FileText size={18} className="text-primary" /> Required Documents</h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                      <span>Original birth certificate issued by municipal body.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                      <span>Report card from the previous academic year.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                      <span>Original Transfer Certificate (TC) countersigned.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                      <span>Three recent passport size photos of the candidate.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                      <span>Aadhaar card copy of student and both parents.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: APPLY ONLINE */}
            {activeTab === "apply" && (
              <div className="max-w-3xl mx-auto bg-card border p-6 sm:p-8 rounded-xl shadow-sm space-y-6">
                <div className="text-center space-y-1 border-b pb-4">
                  <h2 className="text-xl font-bold">Online Admission Application</h2>
                  <p className="text-xs text-muted-foreground">Enter authentic details below to initiate student enrollment.</p>
                </div>

                {appId ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-6 rounded-lg text-center space-y-4">
                    <CheckCircle2 className="mx-auto text-primary w-12 h-12" />
                    <div>
                      <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-300">Registration Submitted Successfully!</h3>
                      <p className="text-sm text-muted-foreground mt-1">Your online application has been securely recorded.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border inline-block px-6 py-3 rounded-lg font-mono font-bold text-lg text-primary shadow-sm">
                      {appId}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Save this Application ID to track the verification status. You can verify it right now in the <strong>Track Application</strong> tab.
                    </p>
                    <button
                      onClick={() => { setAppId(null); setActiveTab("track"); setSearchId(appId); }}
                      className="inline-flex items-center gap-1 bg-primary text-white px-4 py-2 rounded text-xs font-semibold hover:bg-primary-hover transition-colors mt-2"
                    >
                      Track Admission Status <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Student Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.studentName}
                          onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                          className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                          placeholder="e.g. Priyanshu Das"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                        <input
                          type="date"
                          required
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gender</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Class Applied For</label>
                        <select
                          value={formData.className}
                          onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                          className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                        >
                          {["Nursery", "KG", "Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X", "Class XI - Science", "Class XI - Commerce"].map((cl) => (
                            <option key={cl} value={cl}>{cl}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Parent / Guardian Name</label>
                      <input
                        type="text"
                        required
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                        placeholder="e.g. Ramesh Chandra Das"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Parent Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                          placeholder="e.g. +91 94371 XXXXX"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Parent Email Address</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                          placeholder="e.g. parent@email.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Residential Address</label>
                      <textarea
                        required
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                        placeholder="Full address details"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Previous School Attended (If any)</label>
                      <input
                        type="text"
                        value={formData.prevSchool}
                        onChange={(e) => setFormData({ ...formData, prevSchool: e.target.value })}
                        className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                        placeholder="Name of previous school"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-md font-bold text-sm shadow transition-colors cursor-pointer"
                    >
                      {isSubmitting ? "Submitting Registration Form..." : "Submit Registration Application"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: FEES STRUCTURE */}
            {activeTab === "fees" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Annual School Fee Schedule 2026-27</h2>
                
                <div className="overflow-x-auto border rounded-lg bg-card shadow-sm">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted border-b text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                        <th className="p-4">Class Blocks</th>
                        <th className="p-4">Admission Fee (One-Time)</th>
                        <th className="p-4">Tuition Fee (Quarterly)</th>
                        <th className="p-4">Activity Charges (Annual)</th>
                        <th className="p-4">Total First Year Dues</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-muted-foreground">
                      <tr>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">Nursery - KG</td>
                        <td className="p-4">₹ 15,000</td>
                        <td className="p-4">₹ 9,500</td>
                        <td className="p-4">₹ 5,000</td>
                        <td className="p-4 font-semibold text-primary">₹ 58,000</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">Class I - V</td>
                        <td className="p-4">₹ 18,000</td>
                        <td className="p-4">₹ 11,200</td>
                        <td className="p-4">₹ 6,000</td>
                        <td className="p-4 font-semibold text-primary">₹ 68,800</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">Class VI - VIII</td>
                        <td className="p-4">₹ 18,000</td>
                        <td className="p-4">₹ 12,800</td>
                        <td className="p-4">₹ 6,500</td>
                        <td className="p-4 font-semibold text-primary">₹ 75,700</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">Class IX - X</td>
                        <td className="p-4">₹ 20,000</td>
                        <td className="p-4">₹ 15,400</td>
                        <td className="p-4">₹ 7,000</td>
                        <td className="p-4 font-semibold text-primary">₹ 88,600</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">Class XI - XII</td>
                        <td className="p-4">₹ 22,000</td>
                        <td className="p-4">₹ 18,900</td>
                        <td className="p-4">₹ 8,000</td>
                        <td className="p-4 font-semibold text-primary">₹ 105,600</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-lg flex gap-3 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                  <AlertCircle className="shrink-0 w-5 h-5 text-amber-600" />
                  <div className="space-y-1">
                    <h5 className="font-bold">Important Fee Guidelines</h5>
                    <p className="leading-relaxed">
                      1. Admission fee is non-refundable. Transport charges are additional and calculated based on route distance.<br />
                      2. Quarterly fees must be cleared by the 15th of the starting month of each quarter (April, July, October, January) to avoid late penalties.<br />
                      3. Dues can be cleared online through our ERP student/parent portal or at the school bank counter.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TRACK APPLICATION */}
            {activeTab === "track" && (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="bg-card border p-6 rounded-xl shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-center">Track Admission File Status</h2>
                  
                  <form onSubmit={handleTrackSubmit} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      placeholder="e.g. DPS-2026-1015"
                      className="border text-sm rounded p-2 focus:ring focus:outline-none bg-background shrink grow uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm px-4 rounded font-bold cursor-pointer"
                    >
                      Track Application
                    </button>
                  </form>
                  {searchError && (
                    <p className="text-xs text-destructive font-semibold flex items-center gap-1.5"><AlertCircle size={14} /> {searchError}</p>
                  )}
                </div>

                {trackingResult && (
                  <div className="bg-card border p-6 rounded-xl shadow-sm space-y-6">
                    <div className="border-b pb-4 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-semibold text-primary uppercase">Candidate File</span>
                        <h3 className="font-bold text-lg leading-tight mt-0.5">{trackingResult.studentName}</h3>
                      </div>
                      <span className="text-xs font-bold border px-2 py-1 rounded bg-muted text-slate-700 font-mono">
                        {trackingResult.className}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Step tracking map */}
                      <div className="relative flex justify-between text-xs font-bold text-slate-400">
                        {/* Connecting Line */}
                        <div className="absolute top-3.5 left-0 right-0 h-1 bg-muted -z-10"></div>
                        <div
                          className="absolute top-3.5 left-0 h-1 bg-primary -z-10 transition-all duration-500"
                          style={{ width: trackingResult.step === 1 ? "0%" : trackingResult.step === 2 ? "50%" : "100%" }}
                        ></div>

                        {/* Step circles */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            trackingResult.step >= 1 ? "bg-primary text-white border-primary" : "bg-card border-slate-300"
                          }`}>1</span>
                          <span>Registered</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            trackingResult.step >= 2 ? "bg-primary text-white border-primary" : "bg-card border-slate-300"
                          }`}>2</span>
                          <span>Interaction</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            trackingResult.step >= 3 ? "bg-primary text-white border-primary" : "bg-card border-slate-300"
                          }`}>3</span>
                          <span>Enrolled</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/50 border p-4 rounded-lg flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-700 dark:text-slate-300">File Status:</span>
                        <span className="font-extrabold text-primary uppercase text-xs tracking-wider bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-100 dark:border-emerald-900/30">
                          {trackingResult.status}
                        </span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground text-center">
                        Last Update: {trackingResult.date}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
