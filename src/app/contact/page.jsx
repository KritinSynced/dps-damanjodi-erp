"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate contact submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setFormState({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  };

  return (
    <>
      <Navbar />
      
      {/* Banner */}
      <section className="bg-slate-950 py-16 text-center text-white relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0B7A3B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Get in touch with the Delhi Public School, Damanjodi administration office. We are here to help.
          </p>
        </div>
      </section>

      {/* Main contact area */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Contact Details Column */}
            <div className="lg:col-span-5 space-y-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Get in Touch</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Whether you have queries regarding child admissions, term fees, or transfer certificates, feel free to visit the administration block or reach out using the details below.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">School Location</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                      Delhi Public School, NALCO Township,<br />
                      Damanjodi, Dist: Koraput, Odisha - 763008
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
                    <Phone size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Phone Lines</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                      +91 68532 255260<br />
                      +91 68532 255261
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
                    <Mail size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Email Inquiries</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      dpsdamanjodi@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Administration Office Hours</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Monday - Saturday: 08:30 AM to 12:30 PM<br />
                      Closed on Sundays and Gazetted Holidays.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="lg:col-span-7 bg-card border rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-bold text-lg">Send us a Message</h3>
              
              {success ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-6 rounded-lg text-center space-y-3">
                  <CheckCircle2 className="mx-auto text-primary w-10 h-10" />
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300">Message Sent Successfully</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Thank you for reaching out. The administration office will review your inquiry and reply via email within 2-3 business days.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-2 text-xs font-semibold text-primary hover:underline"
                  >
                    Send another query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                        placeholder="e.g. Samir Patnaik"
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
                        placeholder="e.g. samir@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subject</label>
                    <input
                      type="text"
                      required
                      value={formState.subject}
                      onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                      className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                      placeholder="e.g. Admissions Inquiry"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Message / Query Details</label>
                    <textarea
                      required
                      rows={4}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full text-sm border rounded p-2 focus:ring focus:outline-none bg-background"
                      placeholder="Please enter details of your inquiry here..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-md font-bold text-sm shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={16} />
                    {isSubmitting ? "Sending Query..." : "Send Query Message"}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Map Segment */}
      <section className="bg-slate-50 dark:bg-slate-900/10 border-t py-12 text-center text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <MapPin size={32} className="mx-auto text-primary" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">How to Reach the Campus</h3>
          <p className="text-xs max-w-lg mx-auto leading-relaxed">
            DPS Damanjodi is located inside the Nalco Township, approximately 35 KM from Koraput Railway Station and 15 KM from Sunabeda. Auto-rickshaws and local cabs are frequently available from Damanjodi bus terminal.
          </p>
          
          <div className="bg-muted border rounded-xl overflow-hidden h-96 relative shadow-inner max-w-4xl mx-auto mt-4">
            <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-6 text-center text-slate-500">
              <MapPin size={40} className="text-primary animate-bounce mb-2" />
              <h4 className="font-bold text-slate-700">DPS Damanjodi Campus Map</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                A beautiful setting amidst the Panchpatmali Hills.
              </p>
              <div className="mt-4 bg-white border px-3 py-1.5 rounded-md shadow-sm text-xs font-semibold text-primary">
                18.7820° N, 83.0080° E
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
