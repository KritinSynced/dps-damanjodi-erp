import React from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SplashLoader from "@/components/ui/SplashLoader";
import AndroidRedirect from "@/components/AndroidRedirect";
import SchoolCrest from "@/components/3d/SchoolCrest";
import { prisma } from "@/lib/prisma";
import { 
  ArrowRight, Calendar, Award, BookOpen, Clock, 
  MapPin, CheckCircle, GraduationCap, Users, ShieldAlert,
  Compass, Radio, Sparkles
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let announcements = [];
  try {
    const now = new Date();
    announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: { date: "desc" },
      take: 6
    });
  } catch (error) {
    console.error("==========================================");
    console.error("HOMEPAGE DATABASE QUERY ERROR:", error);
    console.error("==========================================");
  }

  // Filter urgent vs events vs general
  const urgentNotices = announcements.filter(a => a.category === "URGENT");
  const otherNotices = announcements.filter(a => a.category !== "URGENT");

  return (
    <>
      <AndroidRedirect />
      <SplashLoader />
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-900 overflow-hidden min-h-[600px] flex items-center">
        {/* Background Image with elegant overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-campus.jpg"
            alt="DPS Damanjodi Campus Layout"
            className="w-full h-full object-cover object-center opacity-30 select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Column 1: Info */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                <Sparkles size={12} className="text-secondary" /> Set up under the aegis of the DPS Society
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Nurturing Minds, <br />
                <span className="text-secondary">Shaping Futures</span>
              </h1>
              <p className="text-slate-300 text-lg sm:text-xl leading-relaxed">
                Delhi Public School, Damanjodi provides a holistic educational environment 
                in collaboration with NALCO, inspiring excellence in academics, sports, and character.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/admissions"
                  className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-hover px-6 py-3.5 rounded-md text-base font-semibold transition-all shadow-lg shadow-primary/20"
                >
                  Apply Online 2026-27
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-100 border border-slate-700 px-6 py-3.5 rounded-md text-base font-semibold transition-all"
                >
                  Explore Campus
                </Link>
              </div>
            </div>

            {/* Column 2: 3D School Crest */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <SchoolCrest />
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE URGENT NOTICES ALERTS (If any) */}
      {urgentNotices.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-y border-amber-200 dark:border-amber-900/30 py-3.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="bg-amber-500 text-white p-1 rounded-full shrink-0 animate-pulse">
                <ShieldAlert size={16} />
              </span>
              <div className="text-amber-800 dark:text-amber-300 text-sm font-semibold">
                <span className="uppercase text-xs tracking-wider mr-2 bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded text-amber-900 dark:text-amber-200">Urgent</span>
                {urgentNotices[0].title} — <span className="font-normal text-amber-700 dark:text-amber-400">{urgentNotices[0].content}</span>
              </div>
            </div>
            <Link href="/academics" className="text-xs font-bold text-amber-900 dark:text-amber-200 underline hover:no-underline">
              View Calendar
            </Link>
          </div>
        </div>
      )}

      {/* 3. QUICK ACCESS CARDS */}
      <section className="relative z-20 -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg shadow-md border flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Academic Programs</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Comprehensive curriculum aligned with CBSE, standard laboratory resources, and dynamic digital learning tools.
              </p>
              <Link href="/academics" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                View Curriculum <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <GraduationCap size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Admissions Open</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Transparent and simple online application process for Nursery to Class XI. Download prospectus and eligibility checklist.
              </p>
              <Link href="/admissions" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                Admissions Guidelines <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">ERP Portals</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Secure digital workspace for students, parents, teachers, and administrators to track reports, attendance, and online fees.
              </p>
              <Link href="/sign-in" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                Login to Portal <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WELCOME & PRINCIPAL MESSAGE */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* School Introduction */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-primary font-bold text-sm tracking-wider uppercase">Welcome to DPS Damanjodi</span>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl tracking-tight">
                  Over Three Decades of Academic Excellence
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-base">
                Established in the scenic Nalco Township of Damanjodi in Koraput district, Odisha, Delhi Public School, Damanjodi stands as a premier co-educational institution. Guided by the vision of &quot;Service Before Self&quot;, we aim to equip children with conceptual knowledge, critical thinking capabilities, and ethical integrity.
              </p>
              <p className="text-muted-foreground leading-relaxed text-base">
                Our partnership with NALCO ensures state-of-the-art infrastructure, comprehensive safety, and extensive extracurricular facilities, creating a thriving environment for kids of both township employees and nearby local communities.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <CheckCircle className="text-primary shrink-0" size={18} />
                  <span>CBSE Affiliated Curriculum</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <CheckCircle className="text-primary shrink-0" size={18} />
                  <span>Interactive Smart Classrooms</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <CheckCircle className="text-primary shrink-0" size={18} />
                  <span>Integrated Science & Math Labs</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <CheckCircle className="text-primary shrink-0" size={18} />
                  <span>Lush 16-Acre Green Campus</span>
                </div>
              </div>
            </div>

            {/* Principal Message Box */}
            <div className="lg:col-span-5 bg-card border rounded-xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row lg:flex-col gap-6 items-center md:items-start lg:items-center">
              <div className="shrink-0 w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
                <img
                  src="https://images.unsplash.com/photo-1580894732444-8febeb78fb3e?auto=format&fit=crop&q=80&w=200"
                  alt="Principal Desk"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4 text-center md:text-left lg:text-center">
                <div>
                  <h3 className="font-bold text-lg leading-tight">Shri P.K. Sahu</h3>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Principal, DPS Damanjodi</span>
                </div>
                <blockquote className="text-sm italic text-muted-foreground leading-relaxed">
                  &quot;Education is not the learning of facts, but the training of the mind to think. We believe in providing an empowering environment where every child discovers their inner potential and develops values that support them through life&apos;s triumphs.&quot;
                </blockquote>
                <div className="pt-2">
                  <Link href="/about" className="text-xs font-bold text-primary hover:underline">
                    Read Full Message
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. NOTICE BOARD & ANNOUNCEMENTS */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/25 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Notices column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Radio className="text-primary animate-pulse" size={20} />
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Live Notice Board
                  </h2>
                </div>
                <Link href="/academics" className="text-xs font-bold text-primary hover:underline">
                  All Announcements
                </Link>
              </div>

              <div className="space-y-4">
                {otherNotices.length > 0 ? (
                  otherNotices.map((notice) => (
                    <div
                      key={notice.id}
                      className="bg-card p-5 rounded-lg border shadow-sm transition-all hover:shadow-md hover:border-primary/30 flex gap-4"
                    >
                      {/* Date Icon block */}
                      <div className="flex flex-col items-center justify-center bg-muted text-muted-foreground w-16 h-16 rounded shrink-0 border">
                        <span className="text-xs uppercase font-bold leading-none tracking-widest text-slate-500">
                          {new Date(notice.date).toLocaleString("en-US", { month: "short" })}
                        </span>
                        <span className="text-xl font-extrabold text-primary mt-1">
                          {new Date(notice.date).getDate()}
                        </span>
                      </div>
                      
                      {/* Content block */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            notice.category === "EVENT" 
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                          }`}>
                            {notice.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Audience: {notice.targetRole === "ALL" ? "Everyone" : notice.targetRole}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                          {notice.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {notice.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No notices currently active.</p>
                )}
              </div>
            </div>

            {/* Events Column */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="text-primary" size={22} />
                Upcoming Events
              </h2>

              <div className="bg-card border rounded-lg p-5 shadow-sm space-y-6">
                <div className="border-l-4 border-secondary pl-4 py-1.5 space-y-1">
                  <span className="text-xs font-semibold text-secondary uppercase">June 14, 2026</span>
                  <h4 className="font-bold text-sm">Class X Parent-Teacher Meeting</h4>
                  <p className="text-xs text-muted-foreground">09:00 AM - 12:30 PM • Main School Auditorium</p>
                </div>

                <div className="border-l-4 border-secondary pl-4 py-1.5 space-y-1">
                  <span className="text-xs font-semibold text-secondary uppercase">June 29, 2026</span>
                  <h4 className="font-bold text-sm">Pre-Board Examination Commences</h4>
                  <p className="text-xs text-muted-foreground">Secondary Classes • CBSE Center Guidelines</p>
                </div>

                <div className="border-l-4 border-secondary pl-4 py-1.5 space-y-1">
                  <span className="text-xs font-semibold text-secondary uppercase">August 15, 2026</span>
                  <h4 className="font-bold text-sm">79th Independence Day Celebration</h4>
                  <p className="text-xs text-muted-foreground">08:00 AM onwards • School Parade Ground</p>
                </div>
                
                <div className="pt-2 text-center">
                  <Link href="/academics" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                    View Academic Calendar <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. STATISTICS STRIP */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <span className="block text-3xl sm:text-4xl font-extrabold text-secondary">1800+</span>
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">Students Enrolled</span>
            </div>
            <div className="space-y-1">
              <span className="block text-3xl sm:text-4xl font-extrabold text-secondary">90+</span>
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">Expert Educators</span>
            </div>
            <div className="space-y-1">
              <span className="block text-3xl sm:text-4xl font-extrabold text-secondary">100%</span>
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">CBSE Pass Rate</span>
            </div>
            <div className="space-y-1">
              <span className="block text-3xl sm:text-4xl font-extrabold text-secondary">16 Acres</span>
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400 uppercase">Green Campus</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FACILITIES SHOWCASE */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-primary font-bold text-sm tracking-wider uppercase">Infrastructure</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl tracking-tight">
              Premium Educational Facilities
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Explore the advanced campus facilities that enable the intellectual, physical, and artistic development of our kids.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all">
              <div className="h-48 overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=400"
                  alt="Smart Classrooms"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Smart Classrooms</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Interactive smartboards, digital projections, and comfortable, ergonomically designed seating.
                </p>
              </div>
            </div>

            <div className="group bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all">
              <div className="h-48 overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=400"
                  alt="Modern Library"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Central Library</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Over 15,000 reference books, magazines, digital resource portals, and dedicated silent study zones.
                </p>
              </div>
            </div>

            <div className="group bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all">
              <div className="h-48 overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400"
                  alt="Composite Science Lab"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Integrated Science Labs</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fully equipped separate Chemistry, Physics, and Biology laboratory modules for senior school experiments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ACADEMIC EXCELLENCE & SUCCESS STORIES */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/25 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            <div className="space-y-2">
              <span className="text-primary font-bold text-sm tracking-wider uppercase">Student Spotlight</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Celebrating Success & Achievements
              </h2>
            </div>
            <Link href="/about" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline shrink-0">
              Read All Success Stories <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                  <Award size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">CBSE XII School Topper</h4>
                  <span className="text-xs text-muted-foreground">Class of 2025</span>
                </div>
              </div>
              <p className="text-sm italic text-muted-foreground leading-relaxed">
                &quot;DPS Damanjodi gave me the wings to fly. The faculty&apos;s personalized attention and rigorous mock testing sessions helped me score 98.6% in the Science stream.&quot;
              </p>
              <div className="font-semibold text-xs text-primary">— Priyanka Mohapatra</div>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                  <Compass size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">National Science Olympiad</h4>
                  <span className="text-xs text-muted-foreground">Gold Medalist</span>
                </div>
              </div>
              <p className="text-sm italic text-muted-foreground leading-relaxed">
                &quot;Our school&apos;s robotics and coding clubs provided exactly the platform I needed. Winning gold at NSO was possible thanks to the teachers&apos; direct mentoring.&quot;
              </p>
              <div className="font-semibold text-xs text-primary">— Aditya Prasad Jena</div>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">State Badminton Meet</h4>
                  <span className="text-xs text-muted-foreground">Double Champion</span>
                </div>
              </div>
              <p className="text-sm italic text-muted-foreground leading-relaxed">
                &quot;Balancing sports and academics is always a challenge, but the school&apos;s flexible coaching schedule and physical instructors guided me every single step.&quot;
              </p>
              <div className="font-semibold text-xs text-primary">— Shruti Samal</div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CONTACT SECTION PREVIEW */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-primary font-bold text-sm tracking-wider uppercase">Contact</span>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl tracking-tight">
                  Reach Out to Us
                </h2>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Have questions about admissions, fees, or course curriculum? Fill out our contact form or visit the school office in the Nalco Township.
                </p>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <MapPin className="text-primary shrink-0" size={18} />
                  <span>Delhi Public School, NALCO Township, Damanjodi, Odisha - 763008</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-primary shrink-0" size={18} />
                  <span>Visitor Hours: Mon - Sat (08:30 AM to 12:30 PM)</span>
                </div>
              </div>
              
              <div>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-primary text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-all"
                >
                  View Details & Map <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Map Simulator */}
            <div className="bg-muted border rounded-xl overflow-hidden h-72 relative shadow-inner">
              {/* Simplified SVG Map representation representing Nalco Damanjodi area */}
              <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <MapPin size={36} className="text-primary animate-bounce mb-2" />
                <h4 className="font-bold text-slate-700">DPS Damanjodi Campus</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Nestled in the green hills of Damanjodi Township, Koraput District, Odisha.
                </p>
                <div className="mt-4 bg-white border px-3 py-1.5 rounded-md shadow-sm text-xs font-semibold text-primary">
                  18°46&apos;55.2&quot;N 83°00&apos;28.8&quot;E
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
