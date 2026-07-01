"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { FlameLogo } from "@/components/ui/FlameLogo";

const DOTS = [
  { size: 1.5, top: "12%", left: "15%", delay: "0s",    dur: "3s"   },
  { size: 1.0, top: "22%", left: "78%", delay: "0.7s",  dur: "4s"   },
  { size: 1.0, top: "65%", left: "8%",  delay: "1.2s",  dur: "3.5s" },
  { size: 1.5, top: "75%", left: "85%", delay: "0.4s",  dur: "5s"   },
  { size: 1.0, top: "45%", left: "92%", delay: "1.8s",  dur: "4s"   },
  { size: 0.8, top: "35%", left: "5%",  delay: "2.1s",  dur: "3s"   },
  { size: 1.2, top: "88%", left: "40%", delay: "0.9s",  dur: "4.5s" },
];

export default function WelcomePage() {
  const { _hasHydrated, accessToken } = useUserStore();
  const router = useRouter();
  const [vis, setVis] = useState(false);

  useEffect(() => {
    if (_hasHydrated && accessToken) router.replace("/chat");
  }, [_hasHydrated, accessToken, router]);

  useEffect(() => {
    const t = setTimeout(() => setVis(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-between px-6 pt-20 pb-12 overflow-hidden select-none"
      style={{ background: "linear-gradient(170deg, #0A0A0A 0%, #130B00 45%, #0A0A0A 100%)" }}
    >
      {/* Ambient orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "85vw", height: "85vw",
          maxWidth: 420, maxHeight: 420,
          top: "30%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.05) 45%, transparent 70%)",
          opacity: vis ? 1 : 0,
          transition: "opacity 1.6s ease-out",
          filter: "blur(1px)",
        }}
      />

      {/* Stars */}
      {DOTS.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: d.size * 3 + "px", height: d.size * 3 + "px",
            top: d.top, left: d.left,
            background: "rgba(255,255,255,0.6)",
            boxShadow: `0 0 ${d.size * 4}px rgba(255,255,255,0.4)`,
            animation: `sparkle ${d.dur} ${d.delay} ease-in-out infinite`,
          }}
        />
      ))}

      {/* ── Center hero ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center text-center gap-7 relative z-10"
        style={{
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
        }}
      >
        {/* Logo */}
        <div className="animate-float-logo">
          <FlameLogo size={96} showSparkle animated />
        </div>

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1">
          <h1
            className="font-black tracking-widest uppercase"
            style={{
              fontSize: "2.25rem",
              letterSpacing: "0.18em",
              background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 60%, #D97706 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            PYROBOT
          </h1>
          <div className="flex items-center gap-3">
            <div style={{ width: 28, height: 1, background: "rgba(245,158,11,0.5)" }} />
            <span className="text-caption text-muted-foreground tracking-widest uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.2em" }}>
              AI Assistant
            </span>
            <div style={{ width: 28, height: 1, background: "rgba(245,158,11,0.5)" }} />
          </div>
        </div>

        {/* Tag line */}
        <div>
          <p className="text-display text-foreground font-black" style={{ fontSize: "1.875rem", lineHeight: 1.2 }}>
            Your <span className="gold-gradient-text">AI.</span> Your{" "}
            <span className="gold-gradient-text">Way.</span>
          </p>
          <p className="text-caption text-muted-foreground mt-3 max-w-xs leading-relaxed">
            Smart, intuitive, and always here to help you think, plan, and create.
          </p>
        </div>
      </div>

      {/* ── CTA Buttons ── */}
      <div
        className="w-full max-w-sm flex flex-col gap-3 relative z-10"
        style={{
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.8s 0.2s ease-out, transform 0.8s 0.2s ease-out",
        }}
      >
        <Link
          href="/register"
          className="flex items-center justify-between w-full px-6 py-4 rounded-2xl font-bold text-black transition-all active:scale-97"
          style={{
            background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 60%, #D97706 100%)",
            boxShadow: "0 4px 20px rgba(245,158,11,0.5), 0 1px 0 rgba(255,255,255,0.2) inset",
            fontSize: "1rem",
          }}
        >
          <span>Get Started</span>
          <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
            <ArrowRight size={16} className="text-white" strokeWidth={2.5} />
          </div>
        </Link>

        <Link
          href="/login"
          className="flex items-center justify-center w-full px-6 py-4 rounded-2xl font-semibold transition-all active:scale-97"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#D4D4D4",
            fontSize: "1rem",
          }}
        >
          I'll Setup Later
        </Link>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 pt-2">
          <div style={{ width: 22, height: 6, borderRadius: 3, background: "var(--pyro-gold)" }} />
          <div style={{ width: 6,  height: 6, borderRadius: 3, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ width: 6,  height: 6, borderRadius: 3, background: "rgba(255,255,255,0.2)" }} />
        </div>
      </div>
    </div>
  );
}
