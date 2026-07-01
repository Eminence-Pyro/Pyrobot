import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(170deg, #0A0A0A 0%, #130B00 45%, #0A0A0A 100%)",
      }}
    >
      {children}
    </div>
  );
}
