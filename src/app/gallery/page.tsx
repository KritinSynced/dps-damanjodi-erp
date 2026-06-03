"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Image, Video, Compass, Sparkles, X } from "lucide-react";

export default function GalleryPage() {
  const [filter, setFilter] = useState<"all" | "annual" | "sports" | "science" | "campus">("all");
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const items = [
    {
      title: "Annual Day Dance Performance",
      category: "annual",
      img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Science Exhibition Robotics Demo",
      category: "science",
      img: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "CBSE Athletic Meet Gold Medalists",
      category: "sports",
      img: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Smart Classroom Lecture",
      category: "campus",
      img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Annual Day Drama Play Group",
      category: "annual",
      img: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Inter-school Cricket Champions",
      category: "sports",
      img: "https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Chemistry Lab Experimentation",
      category: "science",
      img: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Central Library Study Room",
      category: "campus",
      img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600"
    }
  ];

  const filteredItems = filter === "all" ? items : items.filter((item) => item.category === filter);

  return (
    <>
      <Navbar />
      
      {/* Banner */}
      <section className="bg-slate-950 py-16 text-center text-white relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0B7A3B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Campus Gallery</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            A visual overview of student activities, laboratory resources, cultural highlights, and school tournaments.
          </p>
        </div>
      </section>

      {/* Grid and filters */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Category Filter buttons */}
          <div className="flex flex-wrap gap-2 justify-center border-b pb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground hover:bg-muted border-muted"
              }`}
            >
              All Photos
            </button>
            <button
              onClick={() => setFilter("annual")}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                filter === "annual"
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground hover:bg-muted border-muted"
              }`}
            >
              Annual Day
            </button>
            <button
              onClick={() => setFilter("sports")}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                filter === "sports"
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground hover:bg-muted border-muted"
              }`}
            >
              Sports Day
            </button>
            <button
              onClick={() => setFilter("science")}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                filter === "science"
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground hover:bg-muted border-muted"
              }`}
            >
              Science Exhibition
            </button>
            <button
              onClick={() => setFilter("campus")}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                filter === "campus"
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground hover:bg-muted border-muted"
              }`}
            >
              Campus Infrastructure
            </button>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActivePhoto(item.img)}
                className="group bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-shadow select-none relative"
              >
                <div className="h-44 overflow-hidden bg-slate-200">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 mt-2 leading-snug">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 text-white hover:text-primary transition-colors p-2 bg-slate-800/50 rounded-full"
          >
            <X size={24} />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-lg">
            <img
              src={activePhoto}
              alt="Lightbox View"
              className="object-contain max-w-full max-h-[85vh] mx-auto"
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
