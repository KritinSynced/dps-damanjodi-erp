"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function SchoolCrest() {
  const mountRef = useRef(null);
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !mountRef.current) return;

    let scene, camera, renderer, knot, particleSystem;
    let animationFrameId;

    try {
      // 1. Scene Setup
      scene = new THREE.Scene();

      // 2. Camera Setup (Adjusted for nice fit)
      camera = new THREE.PerspectiveCamera(
        40,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 8;

      // 3. Renderer Setup (Glassmorphism look needs alpha transparency)
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
      mountRef.current.appendChild(renderer.domElement);

      // 4. Lights (Dynamic Dual Color Lighting)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const blueDirectionalLight = new THREE.DirectionalLight(0x1e3a8a, 2.5);
      blueDirectionalLight.position.set(-5, 5, 2);
      scene.add(blueDirectionalLight);

      const goldPointLight = new THREE.PointLight(0xf59e0b, 3.5, 20);
      goldPointLight.position.set(5, -3, 3);
      scene.add(goldPointLight);

      // Soft back light for depth
      const backLight = new THREE.DirectionalLight(0x3b82f6, 1);
      backLight.position.set(0, 0, -5);
      scene.add(backLight);

      // 5. Geometry: TorusKnot represents the 3D School Crest knot structure
      const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 120, 16, 2, 3);

      // 6. Gold Metallic clearcoat material
      const goldMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xd97706, // Rich gold base
        metalness: 0.9,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 0.8,
      });

      knot = new THREE.Mesh(geometry, goldMaterial);
      scene.add(knot);

      // 7. Surrounding Orbiting Particle Ring
      const particleCount = 200;
      const particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const goldColor = new THREE.Color(0xfbbf24);
      const blueColor = new THREE.Color(0x3b82f6);

      for (let i = 0; i < particleCount; i++) {
        // Orbit math
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 2.2 + Math.random() * 0.4;
        
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4; // slight height variance
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        // Mix particle colors (gold and blue)
        const isGold = Math.random() > 0.5;
        const pColor = isGold ? goldColor : blueColor;
        colors[i * 3] = pColor.r;
        colors[i * 3 + 1] = pColor.g;
        colors[i * 3 + 2] = pColor.b;
      }

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      particleGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
      );

      // Soft particles material
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
      });

      particleSystem = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particleSystem);

      // 8. Dynamic Animation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        const elapsedTime = clock.getElapsedTime();

        // Rotate Crest
        knot.rotation.x = elapsedTime * 0.25;
        knot.rotation.y = elapsedTime * 0.35;

        // Rotate Particle ring
        particleSystem.rotation.y = elapsedTime * -0.15;

        // Animate gold point light in circle
        goldPointLight.position.x = Math.cos(elapsedTime) * 6;
        goldPointLight.position.z = Math.sin(elapsedTime) * 6;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      // 9. Resize Handling
      const handleResize = () => {
        if (!mountRef.current || !renderer || !camera) return;
        camera.aspect =
          mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
          mountRef.current.clientWidth,
          mountRef.current.clientHeight
        );
      };

      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animationFrameId);
        
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        
        geometry.dispose();
        goldMaterial.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
      };
    } catch (err) {
      console.error("WebGL Initialization failed, using 2D fallback:", err);
      setWebglError(true);
    }
  }, []);

  if (webglError) {
    return <Fallback2DCrest />;
  }

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] md:h-[450px] flex items-center justify-center">
      {/* 3D Viewport container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Floating School Logo Overlay inside the knot */}
      <div className="absolute pointer-events-none z-10 flex flex-col items-center select-none bg-slate-950/20 backdrop-blur-[2px] p-4 rounded-full border border-white/5 animate-pulse">
        <svg
          className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.33l-7.5-5-7.5 5V21"
          />
        </svg>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 mt-2">
          DPS Damanjodi
        </span>
      </div>
    </div>
  );
}

// Beautiful CSS Fallback for systems without WebGL
function Fallback2DCrest() {
  return (
    <div className="w-full h-[320px] flex flex-col items-center justify-center relative">
      <div className="absolute w-56 h-56 rounded-full border border-amber-500/20 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl animate-spin-slow">
        {/* Ring particles */}
        <div className="absolute inset-2 border-2 border-dashed border-blue-600/30 rounded-full animate-reverse-spin"></div>
        
        {/* Core emblem */}
        <div className="absolute flex flex-col items-center text-center p-6 text-white">
          <svg
            className="w-20 h-20 text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.33l-7.5-5-7.5 5V21"
            />
          </svg>
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 mt-3 leading-none">
            Delhi Public School
          </h3>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
            Damanjodi
          </span>
        </div>
      </div>
    </div>
  );
}
