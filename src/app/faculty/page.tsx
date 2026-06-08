import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { Mail, ShieldCheck, GraduationCap, CalendarDays } from "lucide-react";

export const revalidate = 0;

export default async function FacultyPage() {
  // Fetch teachers from the SQLite database
  const dbTeachers = await prisma.teacher.findMany({
    include: {
      user: true
    }
  });

  // Group teachers by department for elegant listing
  const departments: { [key: string]: any[] } = {};
  dbTeachers.forEach(teacher => {
    const dept = teacher.department || "General Sciences";
    if (!departments[dept]) {
      departments[dept] = [];
    }
    departments[dept].push(teacher);
  });

  return (
    <>
      <Navbar />
      
      {/* Banner */}
      <section className="bg-slate-950 py-16 text-center text-white relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0B7A3B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Our Faculty & Educators</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Meet the experienced educators, advisors, and leadership team guiding Delhi Public School, Damanjodi.
          </p>
        </div>
      </section>

      {/* Leadership / Head Desk */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-2xl font-bold tracking-tight text-center">School Administration & Leadership</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card border p-6 rounded-xl text-center space-y-4 shadow-sm">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-primary">
                <img
                  src="https://images.unsplash.com/photo-1580894732444-8febeb78fb3e?auto=format&fit=crop&q=80&w=200"
                  alt="Principal Desk"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-base leading-tight">Shrimati Sujata Pani</h4>
                <span className="text-xs font-semibold text-primary uppercase">Principal</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Over 25 years of educational administration experience. Leading administrative strategies, public-private alignments, and CBSE compliance.
              </p>
            </div>

            <div className="bg-card border p-6 rounded-xl text-center space-y-4 shadow-sm">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-primary">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                  alt="Vice Principal"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-base leading-tight">Dr. Sujata Mohapatra</h4>
                <span className="text-xs font-semibold text-primary uppercase">Vice Principal & Admin In-charge</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ph.D in Literature. Coordinating syllabus structures, staff councils, and parent-teacher scheduling protocols.
              </p>
            </div>

            <div className="bg-card border p-6 rounded-xl text-center space-y-4 shadow-sm">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-primary">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
                  alt="Senior Coordinator"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-base leading-tight">Shri R.K. Senapati</h4>
                <span className="text-xs font-semibold text-primary uppercase">Senior Secondary Coordinator</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                M.Sc (Physics). Overseeing laboratory logistics, CBSE board center setups, and JEE/NEET entrance tracking panels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Directory grouped by departments */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/25 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {Object.keys(departments).map((dept) => (
            <div key={dept} className="space-y-6">
              <div className="border-b pb-2 flex items-center gap-2">
                <span className="w-2 h-6 bg-primary rounded-sm"></span>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase text-sm sm:text-base">
                  {dept} Department
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments[dept].map((teacher) => (
                  <div key={teacher.id} className="bg-card border p-5 rounded-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      {/* Avatar & Basic details */}
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-slate-100 border">
                          <img
                            src={teacher.user.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + teacher.user.name}
                            alt={teacher.user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                            {teacher.user.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-primary tracking-wider uppercase">
                            {teacher.employeeId}
                          </span>
                          {teacher.classTeacherOfClass && (
                            <span className="block text-[10px] font-semibold text-secondary uppercase tracking-widest mt-0.5">
                              Class Teacher: {teacher.classTeacherOfClass}-{teacher.classTeacherOfSection}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Stats details */}
                      <div className="space-y-2 text-xs text-muted-foreground border-t pt-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={16} className="text-primary" />
                          <span><strong>Qualification:</strong> {teacher.qualification}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} className="text-primary" />
                          <span><strong>Joined:</strong> {new Date(teacher.joinDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Mail size={14} className="text-slate-400" /> {teacher.user.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </section>

      <Footer />
    </>
  );
}
