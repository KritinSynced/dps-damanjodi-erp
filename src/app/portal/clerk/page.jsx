"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, Library, Sparkles, Loader2, AlertCircle
} from "lucide-react";

function ClerkDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/admin");
      const data = await res.json();
      if (data.success) {
        setPortalData(data);
      } else {
        setError(data.error || "Failed to load clerk dashboard logs");
      }
    } catch (err) {
      setError("Network error loading dashboard data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="flex-1 p-8 text-center text-red-500">
        <AlertCircle className="mx-auto w-10 h-10 mb-2" />
        <p className="font-bold">{error || "Failed to load clerk portal"}</p>
        <button onClick={fetchData} className="mt-4 text-xs font-semibold text-primary underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-slate-700">
      
      {/* 1. CLERK DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10 max-w-xl space-y-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-emerald-400 border border-primary/30 uppercase tracking-wider">
                <Sparkles size={10} /> Clerk Desk
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {user.name}</h1>
              <p className="text-slate-350 text-xs sm:text-sm font-medium leading-relaxed">
                Delhi Public School Damanjodi Clerk Portal. View active student registries, check enrollment data, and review the school library catalog.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Library size={200} className="translate-x-12 translate-y-12 text-white" />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border p-4 rounded-lg shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-primary/10 rounded-lg text-primary"><Users size={20} /></div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Total Students</span>
                <h4 className="font-extrabold text-lg leading-tight mt-0.5">{portalData.metrics.studentCount}</h4>
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-primary/10 rounded-lg text-primary"><Users size={20} /></div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Educators Registry</span>
                <h4 className="font-extrabold text-lg leading-tight mt-0.5">{portalData.metrics.teacherCount}</h4>
              </div>
            </div>

            <div className="bg-card border p-4 rounded-lg shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-primary/10 rounded-lg text-primary"><Library size={20} /></div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Library Books</span>
                <h4 className="font-extrabold text-lg leading-tight mt-0.5">{portalData.metrics.bookCount}</h4>
              </div>
            </div>
          </div>

          {/* Live Notice Board for Clerk */}
          <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-205 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
              Live Notice Board & Bulletins
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portalData.announcements && portalData.announcements.length > 0 ? (
                portalData.announcements.slice(0, 4).map((notice) => (
                  <div key={notice.id} className="border-l-4 border-primary pl-3 py-1 space-y-0.5 bg-slate-50/50 dark:bg-slate-900/10 p-2.5 rounded text-left">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      {new Date(notice.date).toLocaleDateString()} • {notice.category}
                    </span>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-tight">{notice.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{notice.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic col-span-2">No notices currently active.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENTS REGISTRY TAB */}
      {activeTab === "students" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-slate-800">Students Registry Database</h2>
            <p className="text-xs text-muted-foreground">Directory of all currently active enrolled students (Read-Only).</p>
          </div>

          <div className="overflow-x-auto border rounded-lg bg-card text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-2.5">Adm No</th>
                  <th className="p-2.5">Student Name</th>
                  <th className="p-2.5">Email</th>
                  <th className="p-2.5">Class-Sec</th>
                  <th className="p-2.5">Roll No</th>
                  <th className="p-2.5">Parent / Guardian</th>
                </tr>
              </thead>
              <tbody className="divide-y text-muted-foreground font-medium">
                {portalData.students.map((stud) => (
                  <tr key={stud.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">{stud.admissionNo}</td>
                    <td className="p-2.5 font-bold text-slate-800">{stud.user.name}</td>
                    <td className="p-2.5 font-mono">{stud.user.email}</td>
                    <td className="p-2.5">{stud.class}-{stud.section}</td>
                    <td className="p-2.5 font-bold text-primary">{stud.rollNo}</td>
                    <td className="p-2.5">{stud.parent.user.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. LIBRARY CATALOG TAB */}
      {activeTab === "library" && (
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-slate-800">Library Book Inventory</h2>
            <p className="text-xs text-muted-foreground">Cataloged reference books, categories, shelf locations, and copies availability.</p>
          </div>

          <div className="overflow-x-auto border rounded-lg bg-card text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-2.5">ISBN</th>
                  <th className="p-2.5">Book Title</th>
                  <th className="p-2.5">Author</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Shelf Location</th>
                  <th className="p-2.5 text-right">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y text-muted-foreground font-medium">
                {portalData.books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-mono">{book.isbn}</td>
                    <td className="p-2.5 font-bold text-slate-800">{book.title}</td>
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

    </div>
  );
}

export default function ClerkDashboardPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    }>
      <ClerkDashboardContent />
    </React.Suspense>
  );
}
