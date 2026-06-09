"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Briefcase, FileText, CheckCircle2, ChevronRight, GraduationCap } from "lucide-react";

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    experience: "",
    coverLetter: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const jobs = [
    {
      id: "math-pgt",
      title: "PGT - Mathematics",
      type: "Full-Time",
      experience: "Minimum 5 Years",
      qualification: "Post-Graduate in Mathematics (M.Sc) + B.Ed (Mandatory)",
      description: "Responsible for senior secondary classes (Class XI - XII). Preparing students for board examinations and competitive JEE engineering modules."
    },
    {
      id: "eng-tgt",
      title: "TGT - English",
      type: "Full-Time",
      experience: "Minimum 3 Years",
      qualification: "Post-Graduate/Graduate in English Lit + B.Ed (Mandatory)",
      description: "Responsible for middle and secondary school blocks (Class VI - X). Building communication modules, debate clubs, and CBSE literary preparations."
    },
    {
      id: "lib-assist",
      title: "Library Assistant",
      type: "Full-Time",
      experience: "Minimum 2 Years",
      qualification: "Bachelor of Library Sciences (B.Lib) / Information Sci",
      description: "Managing circulation ledger databases, ordering references, handling digital portal logins, and maintaining silent learning zones."
    }
  ];

  const handleApply = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate application submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setFormState({
        name: "",
        email: "",
        phone: "",
        qualification: "",
        experience: "",
        coverLetter: ""
      });
    }, 1500);
  };

  return (
    <>
      <Navbar />
      
      {/* Banner */}
      <section className="bg-slate-950 py-16 text-center text-white relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0B7A3B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Careers at DPS</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Join a community of dedicated educators. Shape standard schooling in Koraput District, Odisha.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Job Openings List */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                <Briefcase className="text-primary" size={24} /> Active Vacancies
              </h2>
              
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className={`bg-card border p-5 rounded-lg shadow-sm transition-all relative ${
                      selectedJob === job.title
                        ? "border-primary ring-1 ring-primary"
                        : "hover:border-primary/45"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {job.type} • Exp: {job.experience}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base mt-2">{job.title}</h3>
                        <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                          <GraduationCap size={14} className="text-slate-400" /> {job.qualification}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedJob(job.title)}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                      >
                        Apply Now <ChevronRight size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed border-t pt-3">
                      {job.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Submission Form */}
            <div className="lg:col-span-6 bg-card border rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-bold text-lg">Job Application Submission</h3>
              
              {selectedJob ? (
                <p className="text-xs text-muted-foreground bg-primary/10 border-l-4 border-primary p-3 rounded-r-md">
                  Applying for position: <strong className="text-primary uppercase tracking-wide">{selectedJob}</strong>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 border-l-4 border-secondary p-3 rounded-r-md">
                  Please select a vacancy from the left column first, or apply as a general candidate.
                </p>
              )}

              {success ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-6 rounded-lg text-center space-y-3">
                  <CheckCircle2 className="mx-auto text-primary w-10 h-10" />
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300">Application Recorded</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your CV profile has been successfully uploaded to the school staff selection registry. Shortlisted educators will be contacted via email for offline interviews and panel reviews.
                  </p>
                  <button
                    onClick={() => { setSuccess(false); setSelectedJob(null); }}
                    className="mt-2 text-xs font-semibold text-primary hover:underline"
                  >
                    View other openings
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                        placeholder="Candidate name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Highest Academic Degree</label>
                      <input
                        type="text"
                        required
                        value={formState.qualification}
                        onChange={(e) => setFormState({ ...formState, qualification: e.target.value })}
                        className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                        placeholder="e.g. M.Sc (Math), B.Ed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Teaching Experience</label>
                    <input
                      type="text"
                      required
                      value={formState.experience}
                      onChange={(e) => setFormState({ ...formState, experience: e.target.value })}
                      className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                      placeholder="e.g. 6 years in CBSE school"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Brief Cover Letter / Pitch</label>
                    <textarea
                      required
                      rows={4}
                      value={formState.coverLetter}
                      onChange={(e) => setFormState({ ...formState, coverLetter: e.target.value })}
                      className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                      placeholder="Why do you wish to join DPS Damanjodi?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-md font-bold text-sm shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText size={16} />
                    {isSubmitting ? "Uploading Profile..." : "Submit Job Application"}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
