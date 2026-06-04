"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DPSLogo from "./DPSLogo";

export default function SplashLoader() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the splash animation in this session
    const hasSeenSplash = sessionStorage.getItem("dps_splash_seen");
    
    if (!hasSeenSplash) {
      setIsVisible(true);
      // Disable scrolling
      document.body.style.overflow = "hidden";
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Re-enable scrolling
        document.body.style.overflow = "";
        sessionStorage.setItem("dps_splash_seen", "true");
      }, 2200); // Total duration of animation + pause

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            y: "-100%",
            transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center text-white"
        >
          {/* Subtle radial background glow */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0B7A3B_2px,transparent_2px)] [background-size:32px_32px] pointer-events-none"></div>
          
          <div className="flex flex-col items-center space-y-6 z-10">
            {/* Logo container with scale, rotate and fade animation */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotate: 0,
                transition: { 
                  type: "spring",
                  damping: 15,
                  stiffness: 100,
                  duration: 1.0 
                } 
              }}
              className="relative"
            >
              {/* Outer pulsing ring */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0.1, 0.4, 0.1], 
                  scale: [1, 1.3, 1],
                  transition: { 
                    repeat: Infinity, 
                    duration: 2, 
                    ease: "easeInOut" 
                  }
                }}
                className="absolute inset-[-15px] border border-primary/40 rounded-full"
              />
              <DPSLogo size={120} variant="dark" />
            </motion.div>

            {/* Text description with staggered fade in */}
            <div className="flex flex-col items-center text-center space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.5, duration: 0.6, ease: "easeOut" } 
                }}
                className="font-extrabold tracking-widest text-lg sm:text-xl md:text-2xl text-white font-sans"
              >
                DELHI PUBLIC SCHOOL
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 0.8, 
                  y: 0,
                  transition: { delay: 0.7, duration: 0.6, ease: "easeOut" } 
                }}
                className="text-xs sm:text-sm font-semibold tracking-[0.3em] text-secondary uppercase"
              >
                DAMANJODI
              </motion.p>
            </div>
            
            {/* Elegant loading progress line */}
            <div className="w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden relative mt-8">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ 
                  left: "100%",
                  transition: { 
                    repeat: Infinity, 
                    duration: 1.5, 
                    ease: "easeInOut" 
                  } 
                }}
                className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
