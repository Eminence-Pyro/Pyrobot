"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { FlameLogo } from "@/components/ui/FlameLogo";

/* Tiny star positions */
const STARS = [
  { s:2,   t:"8%",  l:"12%", d:"0s",    dur:"3.2s" },
  { s:1.5, t:"18%", l:"82%", d:"0.8s",  dur:"4.1s" },
  { s:1,   t:"62%", l:"6%",  d:"1.4s",  dur:"3.7s" },
  { s:2,   t:"72%", l:"88%", d:"0.3s",  dur:"5.0s" },
  { s:1.5, t:"42%", l:"94%", d:"1.9s",  dur:"4.3s" },
  { s:1,   t:"30%", l:"3%",  d:"2.2s",  dur:"3.0s" },
  { s:1.5, t:"86%", l:"44%", d:"1.0s",  dur:"4.6s" },
  { s:1,   t:"55%", l:"70%", d:"2.6s",  dur:"3.5s" },
];

export default function WelcomePage() {
  const { _hasHydrated, accessToken } = useUserStore();
  const router = useRouter();
  const [vis, setVis] = useState(false);

  useEffect(() => {
    if (_hasHydrated && accessToken) router.replace("/chat");
  }, [_hasHydrated, accessToken, router]);

  useEffect(() => {
    const t = setTimeout(() => setVis(true), 90);
    return () => clearTimeout(t);
  }, []);

  const fadeIn = (delay = 0): React.CSSProperties => ({
    opacity:    vis ? 1 : 0,
    transform:  vis ? "translateY(0)" : "translateY(22px)",
    transition: `opacity 0.7s ${delay}ms ease-out, transform 0.7s ${delay}ms ease-out`,
  });

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-between px-6 pt-16 pb-10 overflow-hidden select-none"
      style={{ background: "linear-gradient(170deg,#0A0A0A 0%,#150900 50%,#0A0A0A 100%)" }}
    >
      {/* ── Ambient gold orb (behind logo) ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          width:"80vw", height:"80vw", maxWidth:380, maxHeight:380,
          top:"22%", left:"50%", transform:"translate(-50%,-50%)",
          background:"radial-gradient(circle,rgba(245,158,11,0.22) 0%,rgba(245,158,11,0.06) 45%,transparent 70%)",
          filter:"blur(2px)",
          opacity: vis ? 1 : 0,
          transition:"opacity 1.5s ease-out",
        }}
      />

      {/* ── Stars ── */}
      {STARS.map((s,i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width:s.s*3, height:s.s*3,
            top:s.t, left:s.l,
            background:"rgba(255,255,255,0.7)",
            boxShadow:`0 0 ${s.s*4}px rgba(255,255,255,0.5)`,
            animation:`sparkle ${s.dur} ${s.d} ease-in-out infinite`,
          }}
        />
      ))}

      {/* ── Spacer ── */}
      <div />

      {/* ── Hero content ── */}
      <div className="flex flex-col items-center text-center gap-8 relative z-10" style={fadeIn()}>
        {/* P Logo floating */}
        <div className="animate-float-logo animate-pulse-gold rounded-[22px] p-1">
          <FlameLogo size={100} />
        </div>

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1.5">
          <h1
            className="font-black tracking-[0.18em] uppercase"
            style={{
              fontSize:"2.25rem",
              background:"linear-gradient(135deg,#FCD34D 0%,#F59E0B 55%,#D97706 100%)",
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              backgroundClip:"text",
            }}
          >
            PYROBOT
          </h1>
          <div className="flex items-center gap-3">
            <div style={{width:30,height:1,background:"rgba(245,158,11,0.4)"}}/>
            <span className="text-micro text-muted-foreground tracking-[0.2em] uppercase">
              AI Assistant
            </span>
            <div style={{width:30,height:1,background:"rgba(245,158,11,0.4)"}}/>
          </div>
        </div>

        {/* Tagline */}
        <div>
          <p className="font-black" style={{fontSize:"1.875rem",lineHeight:1.2,color:"#F0EFED"}}>
            Your <span className="gold-gradient-text">AI.</span>{" "}
            Your <span className="gold-gradient-text">Way.</span>
          </p>
          <p className="text-caption text-muted-foreground mt-3 max-w-[260px] leading-relaxed mx-auto">
            Smart, intuitive, and always here to help you think, plan, and create.
          </p>
        </div>
      </div>

      {/* ── CTAs ── */}
      <div className="w-full max-w-sm flex flex-col gap-3 relative z-10" style={fadeIn(180)}>
        <Link
          href="/register"
          className="flex items-center justify-between px-6 py-4 rounded-2xl font-bold text-black transition-all active:scale-97"
          style={{
            background:"linear-gradient(135deg,#F59E0B 0%,#FBBF24 50%,#D97706 100%)",
            boxShadow:"0 4px 20px rgba(245,158,11,0.55),0 1px 0 rgba(255,255,255,0.2) inset",
            fontSize:"1rem",
          }}
        >
          <span>Get Started</span>
          <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
            <ArrowRight size={16} className="text-white" strokeWidth={2.5}/>
          </div>
        </Link>

        <Link
          href="/login"
          className="flex items-center justify-center px-6 py-4 rounded-2xl font-semibold transition-all active:scale-97"
          style={{
            background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.12)",
            color:"#C4C4C4",
            fontSize:"1rem",
          }}
        >
          I'll Setup Later
        </Link>

        {/* Onboarding dots */}
        <div className="flex justify-center gap-2 pt-1">
          <div style={{width:22,height:6,borderRadius:3,background:"var(--pyro-gold)"}}/>
          <div style={{width:6, height:6,borderRadius:3,background:"rgba(255,255,255,0.2)"}}/>
          <div style={{width:6, height:6,borderRadius:3,background:"rgba(255,255,255,0.2)"}}/>
        </div>
      </div>
    </div>
  );
}
