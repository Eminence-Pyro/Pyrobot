"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, SquarePen } from "lucide-react";

interface ChatTopBarProps {
  title?: string;
}

export function ChatTopBar({ title = "Pyrobot" }: ChatTopBarProps) {
  const router = useRouter();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 glass-topbar"
      style={{ height: 56 }}
    >
      <button
        onClick={() => router.back()}
        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-xl"
        aria-label="Back"
      >
        <ArrowLeft size={22} strokeWidth={1.8} />
      </button>

      <h1
        className="font-black tracking-widest uppercase absolute left-1/2 -translate-x-1/2"
        style={{ fontSize: "0.9375rem", letterSpacing: "0.12em" }}
      >
        {title}
      </h1>

      <button
        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-xl"
        aria-label="Edit chat"
      >
        <SquarePen size={19} strokeWidth={1.8} />
      </button>
    </header>
  );
}
