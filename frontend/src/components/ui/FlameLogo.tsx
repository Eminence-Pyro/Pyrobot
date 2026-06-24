interface FlameLogoProps {
  size?: number;
  className?: string;
}

export function FlameLogo({ size = 48, className = '' }: FlameLogoProps) {
  const id = `flame-${size}`;

  return (
    <svg
      width={size}
      height={Math.round(size * 1.3)}
      viewBox="0 0 48 62"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-outer`}
          x1="24"
          y1="0"
          x2="24"
          y2="62"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <linearGradient
          id={`${id}-inner`}
          x1="24"
          y1="20"
          x2="24"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FCD34D" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Outer flame body */}
      <path
        d="M24 1C24 1 6 18 6 34C6 44.493 14.059 53 24 53C33.941 53 42 44.493 42 34C42 18 24 1 24 1Z"
        fill={`url(#${id}-outer)`}
      />

      {/* Left wing sweep */}
      <path
        d="M24 1C24 1 6 18 6 34C6 34 10 22 20 18C14 26 12 34 12 34C12 40 17 46 24 46C17 38 18 28 24 22C18 30 18 40 24 53C14 48 6 42 6 34C6 18 24 1 24 1Z"
        fill="#B45309"
        opacity="0.4"
      />

      {/* Inner flame highlight */}
      <path
        d="M24 22C24 22 32 31 32 39C32 43.418 28.418 47 24 47C19.582 47 16 43.418 16 39C16 31 24 22 24 22Z"
        fill={`url(#${id}-inner)`}
      />

      {/* Tip highlight */}
      <ellipse
        cx="24"
        cy="8"
        rx="3"
        ry="5"
        fill="#FFFBEB"
        opacity="0.5"
      />
    </svg>
  );
}