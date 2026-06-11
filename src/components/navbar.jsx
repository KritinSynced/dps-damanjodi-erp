"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@clerk/nextjs";
import DPSLogo from "@/components/ui/DPSLogo";
import { Menu, X, LayoutDashboard, LogIn, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { user: clerkUser } = useUser();
  const isHome = pathname === "/";

  // Scroll handler for shadow & background effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Academics", href: "/academics" },
    { label: "Admissions", href: "/admissions" },
    { label: "Faculty", href: "/faculty" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ];

  // Helper to check active state
  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const isNavbarLight = isScrolled || isOpen || !isHome;

  return (
    <header
      className={`z-50 transition-all duration-300 ${
        isHome
          ? isScrolled || isOpen
            ? "fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b shadow-sm"
            : "absolute top-0 left-0 right-0 bg-transparent"
          : "sticky top-0 bg-background border-b shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <Link href="/" className="flex items-center">
            <DPSLogo size={52} showText={true} variant={isNavbarLight ? "color" : "dark"} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isNavbarLight
                    ? isActive(link.href)
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-muted-foreground hover:text-primary"
                    : isActive(link.href)
                      ? "text-secondary border-b-2 border-secondary pb-1"
                      : "text-slate-200 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className={`border-l pl-6 h-6 flex items-center ${isNavbarLight ? "border-muted" : "border-slate-800"}`}>
              {(user || clerkUser) ? (
                <Link
                  href={user ? `/portal/${user.role.toLowerCase()}` : "/register-role"}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary-hover px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm hover:shadow"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary-hover px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm hover:shadow"
                >
                  <LogIn size={16} />
                  ERP Login
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`focus:outline-none p-2 rounded-md transition-colors ${
                isNavbarLight
                  ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                  : "text-slate-200 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden animate-fade-in bg-background border-b shadow-lg absolute w-full left-0">
          <div className="px-2 pt-2 pb-6 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 pb-2 border-t border-muted px-3">
              {(user || clerkUser) ? (
                <Link
                  href={user ? `/portal/${user.role.toLowerCase()}` : "/register-role"}
                  className="flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary-hover py-3 rounded-md text-base font-medium transition-all"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary-hover py-3 rounded-md text-base font-medium transition-all"
                >
                  <LogIn size={18} />
                  ERP Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
