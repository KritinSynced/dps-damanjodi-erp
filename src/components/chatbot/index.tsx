"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, HelpCircle } from "lucide-react";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  time: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I am the DPS Damanjodi AI School Assistant. How can I help you today? You can ask about admissions, fee schedules, exams, or transport.",
      time: "Just now"
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "What is the admission process?",
    "When is the next PTM meeting?",
    "Show the quarterly fee structure",
    "Where is the campus located?"
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const processResponse = (userInput: string) => {
    const query = userInput.toLowerCase();
    let reply = "";

    if (query.includes("admission") || query.includes("apply") || query.includes("enroll") || query.includes("eligibility")) {
      reply = "Admissions for the academic year 2026-27 are open from Nursery up to Class XI. The process involves: 1. Submitting the online registration form. 2. Conceptual interactive tests for Class I and above. 3. Document validation at the admin office. 4. Dues clearing. You can check the 'Admissions' tab on the website to apply.";
    } else if (query.includes("fee") || query.includes("payment") || query.includes("cost") || query.includes("tuition") || query.includes("due")) {
      reply = "The school tuition fees are cleared quarterly. For example: Nursery-KG is ₹9,500/quarter, Class I-V is ₹11,200/quarter, Class IX-X is ₹15,400/quarter, and Senior Secondary (XI-XII) is ₹18,900/quarter. Payment can be processed online via UPI or Cards in the Student/Parent ERP dashboard.";
    } else if (query.includes("ptm") || query.includes("parent") || query.includes("meeting") || query.includes("meet")) {
      reply = "The next Parent-Teacher Meeting (PTM) for secondary classes is scheduled for Saturday, June 14, 2026, starting at 09:30 AM in the Class X block. Parents can confirm their slot in the Parent ERP dashboard.";
    } else if (query.includes("exam") || query.includes("test") || query.includes("schedule") || query.includes("board")) {
      reply = "The academic exams schedule consists of: PT-1 in July 2026, Half Yearly Exams in September 2026, PT-2 in December 2026, and CBSE Board/Promotional Finals in Feb-March 2027. Class X & XII Pre-Boards will begin in January 2027.";
    } else if (query.includes("transport") || query.includes("bus") || query.includes("route") || query.includes("driver")) {
      reply = "We run three main bus routes covering the Nalco Township (Sector 1 & 2), Hill Top, and Mathalput Junction. Our drivers are trained and GPS trackers are active. Parents can check live bus coordinates under the 'Bus Route GPS' tab in the parent dashboard.";
    } else if (query.includes("contact") || query.includes("phone") || query.includes("email") || query.includes("address") || query.includes("map")) {
      reply = "DPS Damanjodi is located inside NALCO Township, Damanjodi, Koraput, Odisha - 763008. You can call the admin office at +91 68532 255260 or email dpsdamanjodi@gmail.com. Visitor hours are Mon-Sat 08:30 AM to 12:30 PM.";
    } else if (query.includes("syllabus") || query.includes("download") || query.includes("holiday") || query.includes("calendar")) {
      reply = "You can download the detailed syllabus for all wings, class guidelines, and holiday lists in the 'Academics' page under 'Syllabus & Resources'.";
    } else {
      reply = "I understand you have a question. Delhi Public School, Damanjodi, set up in collaboration with NALCO under the DPS Society, aims to provide high quality schooling. For specific account credentials or data updates, please log in to the ERP Portal or consult the administration office.";
    }

    const timeString = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "bot",
          text: reply,
          time: timeString
        }
      ]);
    }, 800);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const timeString = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const userMsg: Message = {
      id: messages.length + 1,
      sender: "user",
      text: inputVal.trim(),
      time: timeString
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    processResponse(userMsg.text);
  };

  const handleQuickQuestion = (text: string) => {
    const timeString = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const userMsg: Message = {
      id: messages.length + 1,
      sender: "user",
      text,
      time: timeString
    };
    setMessages((prev) => [...prev, userMsg]);
    processResponse(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print select-none">
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center group relative border border-white/10"
        >
          <MessageSquare size={24} className="group-hover:scale-105 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
          </span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="bg-card border max-w-sm w-[90vw] h-[500px] rounded-xl overflow-hidden shadow-2xl flex flex-col transition-all">
          {/* Header */}
          <div className="bg-primary text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-secondary" />
              <div>
                <h3 className="font-bold text-xs leading-none">DPS School Assistant</h3>
                <span className="text-[9px] text-primary-foreground/80 mt-0.5 block flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span> Online Helper
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 hover:bg-primary-hover rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed space-y-1 ${
                  msg.sender === "user"
                    ? "bg-primary text-white ml-auto rounded-tr-none"
                    : "bg-white dark:bg-slate-800 border text-slate-700 dark:text-slate-300 mr-auto rounded-tl-none shadow-sm"
                }`}
              >
                <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                <span className={`block text-[9px] text-right ${msg.sender === "user" ? "text-primary-foreground/75" : "text-slate-400"}`}>
                  {msg.time}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips (Only shown initially or on click) */}
          <div className="px-4 py-2 border-t bg-slate-50 dark:bg-slate-900/10 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto shrink-0 select-none">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickQuestion(q)}
                className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-muted text-[10px] text-slate-600 dark:text-slate-350 px-2 py-1 rounded-full transition-colors cursor-pointer text-left truncate max-w-full"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-3 border-t flex gap-2 bg-card shrink-0">
            <input
              type="text"
              required
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask me a school question..."
              className="border text-xs rounded p-2 focus:ring focus:outline-none bg-background shrink grow"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white p-2 rounded shrink-0 flex items-center justify-center cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
