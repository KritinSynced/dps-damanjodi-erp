import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Download, Calendar, BookOpen, Clock, FileText, CheckSquare } from "lucide-react";

export default function AcademicsPage() {
  const curricula = [
    {
      stage: "Primary School (Nursery - Class V)",
      focus: "Play-based conceptual learning, language expansion (English, Hindi, Odia), elementary mathematics, environmental awareness, visual arts, and physical training.",
      subjects: ["English", "Hindi/Odia", "Mathematics", "Environmental Studies (EVS)", "Computer Arts", "General Knowledge"]
    },
    {
      stage: "Middle & Secondary School (Class VI - X)",
      focus: "Rigorous alignment with CBSE benchmarks. Developing analytical thinking, specialized science and math models, and structured computer science frameworks.",
      subjects: ["English Language & Lit", "Mathematics", "Science (Phy/Chem/Bio)", "Social Science (Hist/Civ/Geog)", "Third Language (Hindi/Odia/Sanskrit)", "Information Technology"]
    },
    {
      stage: "Senior Secondary School (Class XI - XII)",
      focus: "Specialized streams preparation for board certifications and competitive exams (JEE/NEET/CUET). Integrated lab work, research projects, and seminars.",
      subjects: ["Science Stream: Physics, Chemistry, Mathematics, Biology, Computer Science, English Core", "Commerce Stream: Accountancy, Business Studies, Economics, Applied Math, Physical Education, English Core"]
    }
  ];

  const files = [
    { name: "Syllabus - Senior Secondary (Class XI-XII)", size: "2.4 MB", type: "PDF" },
    { name: "Syllabus - Secondary Wing (Class IX-X)", size: "1.8 MB", type: "PDF" },
    { name: "Syllabus - Middle Wing (Class VI-VIII)", size: "1.5 MB", type: "PDF" },
    { name: "Academic Calendar 2026-27 (Detailed)", size: "950 KB", type: "PDF" },
    { name: "List of Holidays 2026", size: "320 KB", type: "PDF" },
    { name: "CBSE Curriculum Guidelines 2026", size: "3.1 MB", type: "PDF" }
  ];

  const exams = [
    { name: "Periodic Test - I (PT-1)", duration: "July 2026", weightage: "10% weightage" },
    { name: "Half Yearly Examinations", duration: "September 2026", weightage: "30% weightage" },
    { name: "Periodic Test - II (PT-2)", duration: "December 2026", weightage: "10% weightage" },
    { name: "Pre-Board Examinations (Class X & XII)", duration: "January 2027", weightage: "Board Prep Evaluation" },
    { name: "Annual Board / Promotional Examinations", duration: "February - March 2027", weightage: "50% weightage" }
  ];

  return (
    <>
      <Navbar />
      
      {/* Banner */}
      <section className="bg-slate-950 py-16 text-center text-white relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0B7A3B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Academics & Curriculum</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Explore our academic structure, CBSE curriculum alignments, syllabi downloads, and holiday schedules.
          </p>
        </div>
      </section>

      {/* Curriculum Overview */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Structured Class Modules</h2>
            <p className="text-muted-foreground text-sm">
              We offer education from Nursery up to Class XII, aligned with CBSE regulations.
            </p>
          </div>

          <div className="space-y-8">
            {curricula.map((c, i) => (
              <div key={i} className="bg-card border rounded-xl p-6 md:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-2">
                  <div className="p-2.5 bg-primary/10 rounded-md inline-block text-primary">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{c.stage}</h3>
                </div>
                <div className="lg:col-span-8 space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{c.focus}</p>
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-primary tracking-wide uppercase">Core Subjects Included:</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {c.subjects.map((sub, idx) => (
                        <span key={idx} className="text-xs bg-muted border px-2.5 py-1 rounded">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam and Schedule */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/25 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Exam info */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Clock className="text-primary w-6 h-6" /> Examination Structure
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our examination schedule follows CBSE&apos;s continuous and comprehensive evaluation standards. A student&apos;s progress is tracked through regular class tests, unit tests, and terminal exams.
              </p>

              <div className="space-y-3">
                {exams.map((ex, idx) => (
                  <div key={idx} className="bg-card border p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-sm">{ex.name}</h4>
                      <span className="text-xs text-muted-foreground">{ex.duration}</span>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 px-2.5 py-1 rounded font-bold border border-emerald-100 dark:border-emerald-900/30">
                      {ex.weightage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Downloads */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <FileText className="text-primary w-6 h-6" /> Syllabus & Resources
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Download the detailed syllabus guidelines, curriculum breakdowns, and other administrative handouts in PDF format.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {files.map((file, idx) => (
                  <div key={idx} className="bg-card border p-4 rounded-lg shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
                        {file.type} • {file.size}
                      </span>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs mt-2.5 leading-snug line-clamp-2">
                        {file.name}
                      </h4>
                    </div>
                    <button className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline mt-2 self-start cursor-pointer">
                      <Download size={12} /> Download file
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Monthly highlights brief */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
              <Calendar className="text-primary w-6 h-6" /> Academic Calendar Highlights
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Summary of key school milestones and activities planned for the year.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border p-5 rounded-lg space-y-2">
              <span className="text-primary font-bold text-sm">June 2026</span>
              <h4 className="font-bold text-sm">Re-opening & Pre-Boards</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                School reopens after summer vacation. Grade 10 & 12 revision classes begin.
              </p>
            </div>
            <div className="bg-card border p-5 rounded-lg space-y-2">
              <span className="text-primary font-bold text-sm">August 2026</span>
              <h4 className="font-bold text-sm">Patriotic & Sports Meets</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Independence Day parade and intramural athletic tryouts for regional teams.
              </p>
            </div>
            <div className="bg-card border p-5 rounded-lg space-y-2">
              <span className="text-primary font-bold text-sm">November 2026</span>
              <h4 className="font-bold text-sm">UDGAM - Annual Day</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mega cultural event featuring dance, classical music performance, and award ceremonies.
              </p>
            </div>
            <div className="bg-card border p-5 rounded-lg space-y-2">
              <span className="text-primary font-bold text-sm">February 2027</span>
              <h4 className="font-bold text-sm">CBSE Board Exam Finals</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                CBSE theoretical and practical examinations begin at designated district centers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
