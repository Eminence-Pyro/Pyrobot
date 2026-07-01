"use client";
import { type HTMLAttributes } from "react";

interface FlameLogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  variant?: "default" | "mono" | "dark-bg";
}

/**
 * The Pyrobot flame logo.
 * variant="default"  → gold gradient on transparent (light bg)
 * variant="dark-bg"  → gold gradient on dark circle (nav FAB)
 * variant="mono"     → single fill for small usage
 */
export function FlameLogo({
  size = 40,
  variant = "default",
  className = "",
  ...props
}: FlameLogoProps) {
  if (variant === "dark-bg") {
    return (
      <div
        className={`flex-shrink-0 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        {...props}
      >
        <FlameIcon size={size * 0.62} />
      </div>
    );
  }

  return (
    <div
      className={`flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      <FlameIcon size={size} />
    </div>
  );
}

/* ── The actual flame SVG — matches mockup 2 perfectly ── */
export function FlameIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="flameGrad" x1="24" y1="0" x2="24" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#F5C842" />
          <stop offset="45%"  stopColor="#D4920E" />
          <stop offset="100%" stopColor="#A86008" />
        </linearGradient>
        <linearGradient id="flameGrad2" x1="24" y1="10" x2="24" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FBBF24" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* Outer flame */}
      <path
        d="M24 2 C24 2 38 16 38 30 C38 42 32 52 24 58 C16 52 10 42 10 30 C10 16 24 2 24 2Z"
        fill="url(#flameGrad)"
      />
      {/* Inner flame highlight */}
      <path
        d="M24 18 C24 18 32 26 32 34 C32 41 28.5 47 24 50 C19.5 47 16 41 16 34 C16 26 24 18 24 18Z"
        fill="url(#flameGrad2)"
        opacity="0.85"
      />
      {/* Core highlight */}
      <ellipse cx="24" cy="38" rx="5" ry="7" fill="#FEF3C7" opacity="0.5" />
    </svg>
  );
}
