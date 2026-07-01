"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore } from "@/store/userStore";
import { FlameIcon } from "@/components/ui/FlameLogo";

export default function WelcomePage() {
  const { _hasHydrated, accessToken } = useUserStore();
  const router = useRouter();
  const [vis, setVis] = useState(false);

  useEffect(() => {
    if (_hasHydrated && accessToken) router.replace("/chat");
  }, [_hasHydrated, accessToken, router]);

  useEffect(() => {
    const t = setTimeout(() => setVis(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fade = {
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(20px)",
    transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
  };

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 60% -10%, #F5E6B0 0%, #FAFAF5 45%, #FAFAF5 100%)",
      }}
    >
      {/* Decorative orbs — soft gold shapes matching mockup 2 */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 280, height: 280,
          top: -60, right: -60,
          background: "radial-gradient(circle, rgba(212,146,14,0.22) 0%, rgba(245,200,60,0.1) 50%, transparent 75%)",
          borderRadius: "50%",
          filter: "blur(2px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 200, height: 200,
          top: 80, right: 20,
          background: "radial-gradient(circle, rgba(255,230,100,0.35) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(4px)",
        }}
      />

      {/* ── Top: Logo + wordmark ── */}
      <div className="flex flex-col items-center pt-24 pb-6" style={fade}>
        <div className="animate-flame mb-5">
          <FlameIcon size={80} />
        </div>
        <h1
          className="font-black tracking-widest uppercase"
          style={{
            fontSize: "2rem",
            letterSpacing: "0.15em",
            color: "#1A1A1A",
          }}
        >
          PYROBOT
        </h1>
        <p
          className="font-semibold mt-1"
          style={{ color: "#C17D0A", fontSize: "0.9rem", letterSpacing: "0.02em" }}
        >
          Your AI. Your Advantage.
        </p>
      </div>

      {/* ── Middle: Frosted card — taglines ── */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div
          className="w-full max-w-sm rounded-3xl px-8 py-10 text-center card-shadow"
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.9)",
            ...fade,
            transitionDelay: "0.1s",
          }}
        >
          <p
            className="font-bold leading-tight mb-3"
            style={{ fontSize: "1.5rem", color: "#1A1A1A" }}
          >
            Intelligent assistance.<br />
            Limitless possibilities.
          </p>
          <p style={{ color: "#C17D0A", fontWeight: 600, fontSize: "1rem" }}>
            Always by your side.
          </p>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-8">
            <div style={{ width: 22, height: 7, borderRadius: 4, background: "#C17D0A" }} />
            <div style={{ width: 7,  height: 7, borderRadius: 4, background: "rgba(193,125,10,0.25)" }} />
            <div style={{ width: 7,  height: 7, borderRadius: 4, background: "rgba(193,125,10,0.25)" }} />
            <div style={{ width: 7,  height: 7, borderRadius: 4, background: "rgba(193,125,10,0.25)" }} />
          </div>
        </div>
      </div>

      {/* ── Bottom: CTA ── */}
      <div
        className="px-6 pb-12 flex flex-col items-center gap-4"
        style={{ ...fade, transitionDelay: "0.2s" }}
      >
        <Link
          href="/register"
          className="w-full max-w-sm flex items-center justify-center py-4 rounded-2xl font-bold text-white transition-all active:scale-97"
          style={{
            background: "linear-gradient(135deg, #D4920E 0%, #C17D0A 100%)",
            boxShadow: "0 4px 18px rgba(193,125,10,0.45)",
            fontSize: "1.0625rem",
          }}
        >
          Get Started
        </Link>

        <p className="text-caption" style={{ color: "#888" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "#C17D0A" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
