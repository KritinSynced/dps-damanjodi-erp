import React from "react";

export default function DPSLogo({
  className = "",
  size = 48,
  showText = false,
  variant = "color"
}) {
  const textColor = variant === "dark" ? "#ffffff" : "#1f2937";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo.png"
        alt="Delhi Public School Damanjodi Logo"
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />

      {showText && (
        <div className="flex flex-col">
          <span
            className="font-bold tracking-wider leading-none text-sm md:text-base"
            style={{ color: textColor }}
          >
            DELHI PUBLIC SCHOOL
          </span>
          <span
            className="text-xs font-semibold tracking-widest leading-none text-muted-foreground"
            style={{ color: variant === "dark" ? "#e5e7eb" : undefined }}
          >
            DAMANJODI
          </span>
        </div>
      )}
    </div>
  );
}
