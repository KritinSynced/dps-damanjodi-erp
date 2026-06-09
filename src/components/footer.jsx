import React from "react";
import Link from "next/link";
import DPSLogo from "@/components/ui/DPSLogo";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-200 border-t border-slate-800">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <DPSLogo size={56} showText={true} variant="dark" />
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              Delhi Public School, Damanjodi, set up in collaboration with NALCO, 
              strives to provide standard education under the aegis of the DPS Society.
            </p>
            <div className="flex gap-4 pt-2">
              {/* Facebook SVG */}
              <a href="#" className="p-2 bg-slate-800 hover:bg-primary rounded-full transition-colors text-slate-300 hover:text-white" aria-label="Facebook">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* YouTube SVG */}
              <a href="#" className="p-2 bg-slate-800 hover:bg-primary rounded-full transition-colors text-slate-300 hover:text-white" aria-label="YouTube">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.002 3.002 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* Twitter X SVG */}
              <a href="#" className="p-2 bg-slate-800 hover:bg-primary rounded-full transition-colors text-slate-300 hover:text-white" aria-label="Twitter">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wider">QUICK LINKS</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors text-slate-400">
                  About the Campus
                </Link>
              </li>
              <li>
                <Link href="/academics" className="hover:text-primary transition-colors text-slate-400">
                  Academic Calendar
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="hover:text-primary transition-colors text-slate-400">
                  Admission Form
                </Link>
              </li>
              <li>
                <Link href="/faculty" className="hover:text-primary transition-colors text-slate-400">
                  Faculty Directory
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-primary transition-colors text-slate-400">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-primary transition-colors text-slate-400">
                  Careers at DPS
                </Link>
              </li>
            </ul>
          </div>

          {/* Affiliation & Society */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wider">AFFILIATION</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li>
                <span className="text-slate-300 font-medium">Affiliation No:</span> 1530078 (CBSE, New Delhi)
              </li>
              <li>
                <span className="text-slate-300 font-medium">School Code:</span> 15328
              </li>
              <li>
                <a
                  href="https://dpsfamily.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  DPS Society Portal <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nalcoindia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  NALCO Official Website <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-base mb-4 tracking-wider">CONTACT US</h3>
            <div className="flex items-start gap-3 text-sm text-slate-400">
              <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
              <span>
                DPS Damanjodi, NALCO Township,<br />
                Damanjodi, Dist: Koraput,<br />
                Odisha, PIN - 763008
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Phone size={18} className="text-primary shrink-0" />
              <span>+91 68532 55260, 255261</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Mail size={18} className="text-primary shrink-0" />
              <span>dpsdamanjodi@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright bar */}
      <div className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {currentYear} Delhi Public School, Damanjodi. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
            <Link href="/faqs" className="hover:underline">FAQs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
