"use client";
import { type HTMLAttributes } from "react";

interface FlameLogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  showSparkle?: boolean;
  animated?: boolean;
}

export function FlameLogo({
  size = 40,
  showSparkle = false,
  animated = false,
  className = "",
  ...props
}: FlameLogoProps) {
  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #F59E0B, #D97706)",
          opacity: 0.15,
          transform: "scale(1.3)",
          filter: "blur(6px)",
        }}
      />

      {/* Main logo container */}
      <div
        className={`relative w-full h-full rounded-2xl flex items-center justify-center overflow-hidden ${animated ? "animate-pulse-gold" : ""}`}
        style={{
          background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #D97706 100%)",
          boxShadow: "0 2px 12px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        {/* Inner depth */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 60%)",
          }}
        />

        {/* The P letterform */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "62%", height: "62%", position: "relative", zIndex: 1 }}
        >
          <path
            d="M6 4h7.5C16.537 4 19 6.239 19 9s-2.463 5-5.5 5H9v7H6V4Z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M9 9h4c.828 0 1.5-.448 1.5-1S13.828 7 13 7H9v2Z"
            fill="rgba(0,0,0,0.15)"
          />
        </svg>
      </div>

      {/* Sparkle accent */}
      {showSparkle && (
        <div
          className="absolute -top-1.5 -right-1.5 animate-sparkle"
          style={{
            width: size * 0.32,
            height: size * 0.32,
            background: "radial-gradient(circle, #FCD34D 0%, #F59E0B 60%, transparent 100%)",
            borderRadius: "50%",
            boxShadow: "0 0 8px rgba(252,211,77,0.8)",
          }}
        />
      )}
    </div>
  );
}
