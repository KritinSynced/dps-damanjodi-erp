"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import DPSLogo from "@/components/ui/DPSLogo";
import Link from "next/link";
import { 
  User, LayoutDashboard, Calendar, BookOpen, 
  CreditCard, ClipboardList, LogOut, FileSpreadsheet,
  Bus, MessageSquare, Library, Users, Bell, Search, Menu, X
} from "lucide-react";

export default function PortalLayout({ children }) {
  const { user, isLoading, logout, switchRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in");
    } else if (!isLoading && user) {
      if (user.isFirstLogin) {
        router.push(`/set-password?email=${encodeURIComponent(user.email)}`);
        return;
      }
      const isAndroidApp = typeof window !== "undefined" && (
        (window.Capacitor && (window.Capacitor.platform === "android" || window.Capacitor.getPlatform() === "android")) ||
        window.location.search.includes("platform=android")
      );
      
      if (isAndroidApp && user.role !== "STUDENT") {
        alert("Mobile Access Restricted: The DPS Damanjodi Android app is exclusively for Student accounts. Please use a web browser to access your portal.");
        logout();
      }
    }
  }, [user, isLoading, router, logout]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Securing Workspace...</p>
      </div>
    );
  }

  // Define sidebar menu options based on user role
  const menuConfig = {
    STUDENT: [
      { label: "Dashboard", tab: "dashboard", icon: <LayoutDashboard size={18} /> },
      { label: "Attendance", tab: "attendance", icon: <ClipboardList size={18} /> },
      { label: "Timetable", tab: "timetable", icon: <Calendar size={18} /> },
      { label: "Homework", tab: "homework", icon: <BookOpen size={18} /> },
      { label: "Grades & Exams", tab: "grades", icon: <FileSpreadsheet size={18} /> },
      { label: "Leave Request", tab: "leave", icon: <User size={18} /> },
    ],
    TEACHER: [
      { label: "Dashboard", tab: "dashboard", icon: <LayoutDashboard size={18} /> },
      { label: "Class Attendance", tab: "attendance", icon: <ClipboardList size={18} /> },
      { label: "Grades Entry", tab: "grades", icon: <FileSpreadsheet size={18} /> },
      { label: "Leaves Review", tab: "leaves", icon: <User size={18} /> },
    ],
    ADMIN: [
      { label: "Dashboard", tab: "dashboard", icon: <LayoutDashboard size={18} /> },
      { label: "Students Registry", tab: "students", icon: <Users size={18} /> },
      { label: "Teachers Registry", tab: "teachers", icon: <Users size={18} /> },
      { label: "Staff Registry", tab: "staff", icon: <Users size={18} /> },
      { label: "Library Catalog", tab: "library", icon: <Library size={18} /> },
      { label: "Announcements", tab: "announcements", icon: <Bell size={18} /> },
    ],
    PRINCIPAL: [
      { label: "Dashboard", tab: "dashboard", icon: <LayoutDashboard size={18} /> },
      { label: "Teachers Registry", tab: "teachers", icon: <Users size={18} /> },
      { label: "Announcements", tab: "announcements", icon: <Bell size={18} /> },
    ],
    CLERK: [
      { label: "Dashboard", tab: "dashboard", icon: <LayoutDashboard size={18} /> },
      { label: "Students Registry", tab: "students", icon: <Users size={18} /> },
      { label: "Library Catalog", tab: "library", icon: <Library size={18} /> },
    ],
    PEON: [
      { label: "Dashboard", tab: "dashboard", icon: <LayoutDashboard size={18} /> },
    ],
    SECURITY_GUARD: [
      { label: "Dashboard", tab: "dashboard", icon: <LayoutDashboard size={18} /> },
    ]
  };

  const currentMenu = menuConfig[user.role] || [];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row select-none">
      
      {/* 1. DESKTOP SIDEBAR */}
      <DesktopSidebar menu={currentMenu} user={user} logout={logout} switchRole={switchRole} />

      {/* 2. MOBILE HEADER & NAVIGATION */}
      <MobileHeader menu={currentMenu} user={user} logout={logout} switchRole={switchRole} />

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>

      {/* 4. MOBILE BOTTOM NAVIGATION (For Student - Touch friendly) */}
      {user.role === "STUDENT" && (
        <MobileBottomNav menu={currentMenu} user={user} />
      )}
    </div>
  );
}

function DesktopSidebar({ menu, user, logout, switchRole }) {
  return (
    <React.Suspense fallback={<DesktopSidebarInner menu={menu} user={user} logout={logout} switchRole={switchRole} currentTab="" />}>
      <DesktopSidebarWithParams menu={menu} user={user} logout={logout} switchRole={switchRole} />
    </React.Suspense>
  );
}

function DesktopSidebarWithParams({ menu, user, logout, switchRole }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";
  return <DesktopSidebarInner menu={menu} user={user} logout={logout} switchRole={switchRole} currentTab={currentTab} />;
}

function DesktopSidebarInner({ menu, user, logout, currentTab, switchRole }) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 shrink-0">
      {/* Sidebar Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800 shrink-0">
        <Link href="/">
          <DPSLogo size={42} showText={true} variant="dark" />
        </Link>
      </div>

      {/* Sidebar User Info */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
          <img src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div className="overflow-hidden leading-tight flex flex-col gap-0.5">
          <div className="font-bold text-sm text-white truncate">
            {(!user.name || user.name === "Clerk User" || user.name === "New User") && user.username ? user.username : user.name}
          </div>
          {user.username && (
            <div className="text-[11px] text-slate-400 font-medium truncate">@{user.username}</div>
          )}
          {user.availableRoles && user.availableRoles.length > 1 ? (
            <div className="mt-1">
              <select
                value={user.role}
                onChange={(e) => switchRole(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-primary text-[10px] font-bold uppercase tracking-wider rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer w-full text-center"
              >
                {user.availableRoles.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white font-semibold">
                    {r} Portal
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">{user.role} Portal</span>
          )}
        </div>
      </div>

      {/* Sidebar Menu items */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {menu.map((item) => (
          <Link
            key={item.tab}
            href={`/portal/${user.role.toLowerCase()}?tab=${item.tab}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              currentTab === item.tab
                ? "bg-primary text-white shadow shadow-primary/20"
                : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Sidebar Footer (Logout) */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold hover:bg-red-950/20 hover:text-red-300 transition-colors text-slate-400 cursor-pointer"
        >
          <LogOut size={18} />
          Secure Logout
        </button>
      </div>
    </aside>
  );
}

function MobileHeader({ menu, user, logout, switchRole }) {
  return (
    <React.Suspense fallback={<MobileHeaderInner menu={menu} user={user} logout={logout} switchRole={switchRole} currentTab="" />}>
      <MobileHeaderWithParams menu={menu} user={user} logout={logout} switchRole={switchRole} />
    </React.Suspense>
  );
}

function MobileHeaderWithParams({ menu, user, logout, switchRole }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";
  return <MobileHeaderInner menu={menu} user={user} logout={logout} switchRole={switchRole} currentTab={currentTab} />;
}

function MobileHeaderInner({ menu, user, logout, currentTab, switchRole }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="md:hidden flex flex-col w-full bg-slate-900 border-b border-slate-800 text-white shrink-0">
      <div className="h-16 px-4 flex items-center justify-between">
        <Link href="/">
          <DPSLogo size={36} showText={true} variant="dark" />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="px-2 pt-2 pb-6 space-y-1 border-t border-slate-800 bg-slate-900/95 absolute w-full top-16 left-0 z-40 shadow-lg">
          {/* Mobile User Info */}
          <div className="p-3 border-b border-slate-800 flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
              <img src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden leading-tight flex flex-col gap-0.5">
              <div className="font-bold text-xs text-white truncate">
                {(!user.name || user.name === "Clerk User" || user.name === "New User") && user.username ? user.username : user.name}
              </div>
              {user.username && (
                <div className="text-[10px] text-slate-400 font-medium truncate">@{user.username}</div>
              )}
              {user.availableRoles && user.availableRoles.length > 1 ? (
                <div className="mt-1">
                  <select
                    value={user.role}
                    onChange={(e) => switchRole(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-primary text-[10px] font-bold uppercase tracking-wider rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer w-full text-center"
                  >
                    {user.availableRoles.map((r) => (
                      <option key={r} value={r} className="bg-slate-900 text-white font-semibold">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-[8px] font-bold text-primary uppercase tracking-widest mt-0.5">{user.role} Portal</span>
              )}
            </div>
          </div>
          {menu.map((item) => (
            <Link
              key={item.tab}
              href={`/portal/${user.role.toLowerCase()}?tab=${item.tab}`}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-semibold tracking-wide ${
                currentTab === item.tab
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <div className="border-t border-slate-800 pt-4 px-3">
            <button
              onClick={() => { setMobileMenuOpen(false); logout(); }}
              className="flex w-full items-center justify-center gap-3 bg-red-950/30 text-red-300 border border-red-900/50 py-3 rounded-md text-sm font-semibold"
            >
              <LogOut size={18} />
              Secure Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileBottomNav({ menu, user }) {
  return (
    <React.Suspense fallback={<MobileBottomNavInner menu={menu} user={user} currentTab="" />}>
      <MobileBottomNavWithParams menu={menu} user={user} />
    </React.Suspense>
  );
}

function MobileBottomNavWithParams({ menu, user }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";
  return <MobileBottomNavInner menu={menu} user={user} currentTab={currentTab} />;
}

function MobileBottomNavInner({ menu, user, currentTab }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-800 text-slate-400 h-16 flex items-center justify-around">
      {menu.slice(0, 4).map((item) => (
        <Link
          key={item.tab}
          href={`/portal/${user.role.toLowerCase()}?tab=${item.tab}`}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === item.tab ? "text-primary scale-105" : "hover:text-white"
          }`}
        >
          {item.icon}
          <span className="text-[10px] font-bold">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
