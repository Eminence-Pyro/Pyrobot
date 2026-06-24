'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { FlameLogo } from '@/components/ui/FlameLogo';

export default function WelcomePage() {
  const { _hasHydrated, accessToken } = useUserStore();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (_hasHydrated && accessToken) {
      router.replace('/chat');
    }
  }, [_hasHydrated, accessToken, router]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-between px-6 py-16 overflow-hidden"
      style={{
        background:
          'linear-gradient(160deg, #0A0A0A 0%, #1A0F00 50%, #0A0A0A 100%)',
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 65%, rgba(217,119,6,0.18) 0%, transparent 70%)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 1.4s ease-out',
        }}
      />

      {/* Subtle star-field texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 60% 80%, rgba(255,255,255,0.2) 0%, transparent 100%), radial-gradient(1px 1px at 35% 65%, rgba(255,255,255,0.25) 0%, transparent 100%)',
        }}
      />

      <div />

      {/* Center content */}
      <div
        className="flex flex-col items-center text-center gap-8 relative z-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
        }}
      >
        {/* Flame logo */}
        <div className="relative">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle, rgba(217,119,6,0.3) 0%, transparent 70%)',
              transform: 'scale(2.5)',
              filter: 'blur(20px)',
            }}
          />
          <FlameLogo size={96} className="relative" />
        </div>

        {/* Wordmark */}
        <div className="space-y-2">
          <h1 className="text-display font-black tracking-[0.2em] text-white uppercase">
            PYROBOT
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-gold/50" />
            <span className="text-caption tracking-widest text-gold/70 uppercase font-medium">
              AI Assistant
            </span>
            <div className="h-px w-10 bg-gold/50" />
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <p className="text-heading font-bold text-white leading-tight">
            Your <span className="text-gold">AI</span>. Your Way.
          </p>
          <p className="text-body text-white/55 max-w-[280px] leading-relaxed">
            Smart, intuitive, and always here to help you think, plan, and
            create.
          </p>
        </div>

        {/* Onboarding dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === 0 ? 'w-6 bg-gold' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div
        className="w-full max-w-sm space-y-3 relative z-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition:
            'opacity 0.7s ease-out 0.2s, transform 0.7s ease-out 0.2s',
        }}
      >
        <Link
          href="/register"
          className="flex items-center justify-center gap-3 w-full rounded-2xl py-4 font-bold text-body text-white active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
            boxShadow:
              '0 0 40px rgba(217,119,6,0.35), 0 4px 20px rgba(0,0,0,0.4)',
            transition: 'transform var(--animate-spring)',
          }}
        >
          Get Started
          <ArrowRight size={18} strokeWidth={2.5} />
        </Link>

        <Link
          href="/login"
          className="flex items-center justify-center w-full rounded-2xl py-4 font-medium text-body text-white/60 border border-white/10 hover:border-white/25 active:scale-[0.97]"
          style={{
            transition:
              'transform var(--animate-spring), border-color var(--animate-normal)',
          }}
        >
          I'll Setup Later
        </Link>
      </div>
    </div>
  );
}