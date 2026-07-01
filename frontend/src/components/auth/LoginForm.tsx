"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";
import { FlameLogo } from "@/components/ui/FlameLogo";

export function LoginForm() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm mx-auto px-4">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <FlameLogo size={64} showSparkle />
        <div className="text-center">
          <h1 className="text-title font-black text-foreground">Welcome back</h1>
          <p className="text-caption text-muted-foreground mt-0.5">Sign in to Pyrobot</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-micro text-muted-foreground uppercase tracking-wider font-semibold pl-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3.5 rounded-2xl text-body text-foreground placeholder:text-muted-foreground outline-none transition-all"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
            onFocus={e => e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)"}
            onBlur={e => e.currentTarget.style.borderColor  = "var(--border)"}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-micro text-muted-foreground uppercase tracking-wider font-semibold pl-1">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3.5 pr-12 rounded-2xl text-body text-foreground placeholder:text-muted-foreground outline-none transition-all"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)"}
              onBlur={e => e.currentTarget.style.borderColor  = "var(--border)"}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {login.error && (
          <p className="text-caption text-destructive text-center px-2">
            {String(login.error)}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={login.isPending}
          className="w-full py-4 rounded-2xl font-bold text-black transition-all active:scale-97 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            boxShadow: "0 4px 20px rgba(245,158,11,0.4)",
            marginTop: "8px",
          }}
        >
          {login.isPending ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Sign In"}
        </button>
      </form>

      <p className="text-caption text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="gold-text font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
