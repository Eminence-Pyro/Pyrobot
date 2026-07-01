"use client";

interface FlameLogoProps {
  size?: number;
  showSparkle?: boolean;
  className?: string;
}

/**
 * The Pyrobot "P" flame logo — as shown in mockup 1.
 * A bold golden "P" letterform with a flame/fire crown on top and an
 * optional sparkle accent dot (used in TopBar wordmark).
 */
export function FlameLogo({ size = 40, showSparkle = false, className = "" }: FlameLogoProps) {
  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main gold gradient */}
          <linearGradient id={`pyro-gold-${size}`} x1="0" y1="0" x2="0" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#FCD34D" />
            <stop offset="55%"  stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          {/* Flame gradient */}
          <linearGradient id={`pyro-flame-${size}`} x1="40" y1="0" x2="40" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
          {/* Glow filter */}
          <filter id={`pyro-glow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Outer flame crown (behind the P) */}
        <path
          d="M40 2 C40 2 52 14 50 24 C48 16 44 14 40 18 C36 14 32 16 30 24 C28 14 40 2 40 2Z"
          fill={`url(#pyro-flame-${size})`}
          opacity="0.9"
        />

        {/* Main "P" body — bold, rounded */}
        <path
          d="M18 72 L18 18 L44 18 C54.493 18 63 25.163 63 34 C63 42.837 54.493 50 44 50 L32 50 L32 72 Z"
          fill={`url(#pyro-gold-${size})`}
          filter={`url(#pyro-glow-${size})`}
        />

        {/* P counter-form (negative space makes it look like a P) */}
        <path
          d="M32 28 L44 28 C48.418 28 52 30.686 52 34 C52 37.314 48.418 40 44 40 L32 40 Z"
          fill="#0A0A0A"
          opacity="0.85"
        />

        {/* Specular highlight on the P */}
        <path
          d="M20 20 L40 20 C46 20 50 23 50 28 C46 25 38 25 32 26 L20 26 Z"
          fill="rgba(255,255,255,0.18)"
        />
      </svg>

      {/* Sparkle dot — shown in TopBar "Pyrobot ✦" */}
      {showSparkle && (
        <div
          className="absolute animate-sparkle"
          style={{
            top: -2,
            right: -2,
            width: size * 0.28,
            height: size * 0.28,
            background: "radial-gradient(circle, #FCD34D 0%, #F59E0B 60%, transparent 100%)",
            borderRadius: "50%",
            boxShadow: "0 0 8px rgba(252,211,77,0.8)",
          }}
        />
      )}
    </div>
  );
}

/** Convenience: standalone flame only (used in auth screens) */
export function FlameIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fi-g" x1="24" y1="0" x2="24" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FCD34D"/>
          <stop offset="50%"  stopColor="#F59E0B"/>
          <stop offset="100%" stopColor="#D97706"/>
        </linearGradient>
        <linearGradient id="fi-g2" x1="24" y1="12" x2="24" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FFFBEB" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      <path d="M24 2 C24 2 38 16 38 30 C38 43 32 53 24 58 C16 53 10 43 10 30 C10 16 24 2 24 2Z" fill="url(#fi-g)"/>
      <path d="M24 20 C24 20 32 28 32 36 C32 43 28.5 49 24 52 C19.5 49 16 43 16 36 C16 28 24 20 24 20Z" fill="url(#fi-g2)"/>
      <ellipse cx="24" cy="40" rx="4.5" ry="6" fill="#FFFBEB" opacity="0.45"/>
    </svg>
  );
}
