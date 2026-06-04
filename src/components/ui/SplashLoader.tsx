"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DPSLogo from "./DPSLogo";

export default function SplashLoader() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen the splash in this session
    const hasSeenSplash = sessionStorage.getItem("dps_splash_seen");
    
    if (!hasSeenSplash) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "";
        sessionStorage.setItem("dps_splash_seen", "true");
      }, 2600); // Slightly longer for the complete premium sequence

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    }
  }, []);

  const schoolTitle = "DELHI PUBLIC SCHOOL";
  const schoolSub = "DAMANJODI";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center text-white select-none"
        >
          {/* 1. Cinematic Background: Floating Particles & Glow */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            className="absolute inset-0 bg-[radial-gradient(#0B7A3B_2px,transparent_2px)] [background-size:24px_24px] pointer-events-none"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.15, 0.3, 0.15],
              scale: [1, 1.1, 1],
              transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute w-[500px] h-[500px] rounded-full bg-primary/20 blur-[80px] pointer-events-none"
          />

          {/* 2. Main Logo & Text Content Container */}
          <div className="flex flex-col items-center space-y-8 z-10">
            
            {/* Logo Wrapper with Elastic Spring Entrance & Cinematic Zoom-Through Exit */}
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotate: 0,
                transition: { 
                  type: "spring",
                  damping: 12,
                  stiffness: 80,
                  delay: 0.2
                } 
              }}
              exit={{
                scale: 4,
                opacity: 0,
                filter: "blur(12px)",
                transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] }
              }}
              className="relative cursor-default"
            >
              {/* Concentric Wave Ripples (expanding outwards) */}
              <motion.div 
                animate={{ 
                  scale: [1, 2.2], 
                  opacity: [0.6, 0] 
                }}
                transition={{ 
                  duration: 2.2, 
                  repeat: Infinity, 
                  ease: "easeOut",
                  delay: 0.5 
                }}
                className="absolute inset-0 border-2 border-primary rounded-full"
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.8], 
                  opacity: [0.4, 0] 
                }}
                transition={{ 
                  duration: 2.2, 
                  repeat: Infinity, 
                  ease: "easeOut",
                  delay: 1.2
                }}
                className="absolute inset-0 border border-secondary rounded-full"
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.4], 
                  opacity: [0.3, 0] 
                }}
                transition={{ 
                  duration: 2.2, 
                  repeat: Infinity, 
                  ease: "easeOut",
                  delay: 1.9
                }}
                className="absolute inset-0 border border-primary/60 rounded-full"
              />

              {/* The Actual Logo with a gentle float effect */}
              <motion.div
                animate={{
                  y: [0, -6, 0],
                  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <DPSLogo size={140} variant="dark" />
              </motion.div>
            </motion.div>

            {/* Text Title with Staggered Word Reveal */}
            <div className="flex flex-col items-center text-center space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.7, duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] } 
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                  transition: { duration: 0.4 }
                }}
                className="font-extrabold tracking-[0.25em] text-xl sm:text-2xl md:text-3xl text-white font-sans drop-shadow-lg"
              >
                {schoolTitle.split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.7 + i * 0.15, duration: 0.5 }
                    }}
                    className="inline-block mr-3"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 0.9, 
                  scale: 1,
                  transition: { delay: 1.3, duration: 0.6 } 
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.3 }
                }}
                className="text-xs sm:text-sm font-semibold tracking-[0.4em] text-secondary uppercase bg-slate-900/50 border border-slate-800/80 px-4 py-1.5 rounded-full shadow-inner"
              >
                {schoolSub}
              </motion.p>
            </div>
            
            {/* Elegant Line Loading Bar */}
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: 220, 
                opacity: 1,
                transition: { delay: 0.8, duration: 1.2, ease: "easeOut" }
              }}
              exit={{
                opacity: 0,
                width: 100,
                transition: { duration: 0.4 }
              }}
              className="h-[2px] bg-slate-800 rounded-full overflow-hidden relative"
            >
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ 
                  left: "100%",
                  transition: { 
                    repeat: Infinity, 
                    duration: 1.6, 
                    ease: "easeInOut" 
                  } 
                }}
                className="absolute top-0 bottom-0 w-28 bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
