import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ShieldCheck, Lock, Eye } from "lucide-react";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      
      <section className="bg-slate-950 py-12 text-center text-white relative">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0B7A3B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Last updated: June 3, 2026</p>
        </div>
      </section>

      <section className="py-12 bg-background text-sm text-muted-foreground leading-relaxed">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900/30 p-5 rounded-lg border">
            <ShieldCheck className="text-primary shrink-0 w-6 h-6 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Our Commitment to Data Safety</h3>
              <p>
                At Delhi Public School, Damanjodi, we are committed to protecting the privacy of our students, parents, educators, and visitors. This policy outlines how we handle personal academic and administrative records within our ERP database.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">1. Information We Collect</h3>
            <p>
              We collect information necessary for school administration, including student profiles (names, admission numbers, grades, attendance), and parent contact details (telephone, emails, occupation).
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">2. How We Use Your Data</h3>
            <p>
              Academic profiles and class attendance are utilized strictly to update portals, issue official report cards, and dispatch PTM schedules. We do not sell or lease student records to external marketing firms.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">3. Security Standards</h3>
            <p>
              Data is stored locally in secured SQLite databases, protected by user credential hashes. ERP portal access is restricted based on system roles (Student, Parent, Teacher, Admin) with route guards active on the server.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">4. Contact Admin Office</h3>
            <p>
              For concerns regarding student records modification or database deletion requests, please contact the administration desk at +91 68532 255260 or email dpsdamanjodi@gmail.com.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
