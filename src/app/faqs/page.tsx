import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { HelpCircle, ArrowRight } from "lucide-react";

export default function FaqsPage() {
  const faqs = [
    {
      q: "What is the primary admission eligibility criteria?",
      a: "For Nursery, the child must complete 3 years of age as of March 31st of the academic session year. For higher classes, students must clear basic conceptual evaluations and present original Transfer Certificates (TC) from recognized schools."
    },
    {
      q: "How can I pay my child's outstanding fees?",
      a: "Login to the Parent ERP Portal, select the 'Fees' tab, review outstanding bills, and click 'Pay Online'. We support UPI (simulated QR), credit/debit cards, and net banking. Automatic receipts will be issued for download."
    },
    {
      q: "Where can I find the weekly class schedule or syllabus guidelines?",
      a: "Registered students can check the 'Timetable' and 'Homework' tabs directly on their Student dashboard. Public visitors can download course outlines from the 'Academics' page under 'Syllabus & Resources'."
    },
    {
      q: "How is the bus route tracking GPS updated?",
      a: "GPS trackers on school buses update coordinates every 15 seconds. Parents can check live movements on their Parent dashboard under the 'Bus Route GPS' tab to see current stops and times."
    },
    {
      q: "Who should I contact for portal credential issues?",
      a: "If you forget your password or face login blocks, please consult Dr. Sujata Mohapatra (Admin In-charge) at the school admin desk, or send an email query to dpsdamanjodi@gmail.com."
    }
  ];

  return (
    <>
      <Navbar />
      
      <section className="bg-slate-950 py-12 text-center text-white relative">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0B7A3B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Find answers to common school and ERP portal queries.</p>
        </div>
      </section>

      <section className="py-12 bg-background text-sm text-muted-foreground leading-relaxed">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-card border p-5 rounded-lg shadow-sm space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-start gap-2 text-sm sm:text-base leading-snug">
                  <HelpCircle className="text-primary shrink-0 w-5 h-5 mt-0.5" />
                  {faq.q}
                </h4>
                <p className="pl-7 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
