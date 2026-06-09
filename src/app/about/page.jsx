import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Compass, BookOpen, ShieldCheck, Heart, MapPin, Building2, Flame } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      title: "Service Before Self",
      desc: "Our motto directs students to prioritize the welfare of society and nation above individual desires, building deep social consciousness.",
      icon: <Flame className="w-6 h-6 text-primary" />
    },
    {
      title: "Holistic Growth",
      desc: "Fostering academic brilliance while promoting physical, ethical, emotional, and creative intelligence.",
      icon: <Compass className="w-6 h-6 text-primary" />
    },
    {
      title: "Scientific Temper",
      desc: "Encouraging rational logic, exploratory curiosity, and critical scientific analytics through active lab participation.",
      icon: <BookOpen className="w-6 h-6 text-primary" />
    },
    {
      title: "Ethical Integrity",
      desc: "Inculcating strong moral principles, mutual respect, discipline, and absolute accountability inside and outside the classroom.",
      icon: <ShieldCheck className="w-6 h-6 text-primary" />
    }
  ];

  return (
    <>
      <Navbar />
      
      {/* Banner */}
      <section className="bg-slate-950 py-16 text-center text-white relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0B7A3B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">About Our School</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Discover the legacy, values, governing council, and learning infrastructure of Delhi Public School, Damanjodi.
          </p>
        </div>
      </section>

      {/* History Legacy */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Our Legacy & Foundation</h2>
              <p className="text-muted-foreground leading-relaxed">
                Delhi Public School, Damanjodi was established in **1985** under the sponsorship of **National Aluminium Company Limited (NALCO)**, a Navratna Enterprise of the Government of India, to provide quality education to the children of NALCO employees and the surrounding rural population in the Koraput region.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Managed by the Delhi Public School Society, New Delhi, the school has grown from a humble primary setup to a premier Senior Secondary Institution. Today, it stands as a symbol of academic rigor and structured co-curricular training in southern Odisha.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Over the past 40 years, our students have consistently topped regional and national levels in CBSE board exams, sports competitions, and engineering/medical entrance evaluations.
              </p>
            </div>
            
            <div className="lg:col-span-5 relative h-80 rounded-xl overflow-hidden shadow-md">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600"
                alt="School history block"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/25 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-card border p-8 rounded-xl shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <Compass className="w-5 h-5 text-secondary" /> OUR VISION
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                To evolve into a center of learning that empowers young minds with modern academic skills, robust moral frameworks, and social responsibility, enabling them to lead and serve the global community effectively.
              </p>
            </div>

            <div className="bg-card border p-8 rounded-xl shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary" /> OUR MISSION
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                To provide standard-defining schooling at competitive costs, implement interactive and digit-empowered pedagogy, cultivate environmental awareness, and foster physical athleticism to build well-balanced national citizens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Our Core Values</h2>
            <p className="text-muted-foreground text-sm mt-2">
              The fundamental principles that guide our day-to-day discipline, administration, and learning process.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-card p-6 rounded-lg border shadow-sm space-y-3">
                <div className="p-2.5 bg-primary/10 rounded-md inline-block">
                  {v.icon}
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">{v.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/25 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Infrastructure & Campus Facilities</h2>
            <p className="text-muted-foreground text-sm mt-2">
              A brief tour of the resources available to our students and staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-lg border flex gap-4">
              <Building2 className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div className="space-y-1">
                <h4 className="font-bold text-base">State-of-the-Art Labs</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Apart from core physics, chemistry, and biology labs, we offer a dedicated computer sciences facility with high-speed internet, a language training room, and a mathematics learning center.
                </p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border flex gap-4">
              <MapPin className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div className="space-y-1">
                <h4 className="font-bold text-base">Sports Grounds & Gym</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our parade grounds host competitive football and cricket leagues. Additionally, we have a fully equipped basketball court, badminton facilities, and table-tennis indoor sets.
                </p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border flex gap-4">
              <Building2 className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div className="space-y-1">
                <h4 className="font-bold text-base">Hostel & Medical Wing</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The campus features a fully staffed medical clinic supported by doctors from the NALCO Hospital, providing immediate primary care and routine health reviews.
                </p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border flex gap-4">
              <MapPin className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div className="space-y-1">
                <h4 className="font-bold text-base">Smart Audio-Visual Hall</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A high-capacity seminar theater with advanced acoustics, serving as the central venue for debate competitions, guest lectures, and cultural performances.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
