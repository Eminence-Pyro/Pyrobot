"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";
import { FlameIcon } from "@/components/ui/FlameLogo";

export function LoginForm() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const login = useLogin();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="flex flex-col w-full max-w-sm mx-auto px-5 pt-16 pb-8">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="animate-flame mb-4">
          <FlameIcon size={56} />
        </div>
        <h1 className="text-title font-black text-foreground">Welcome back</h1>
        <p className="text-caption text-muted-foreground mt-1">Sign in to Pyrobot</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-micro uppercase tracking-wider font-semibold text-muted-foreground pl-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3.5 rounded-2xl text-body text-foreground placeholder:text-muted-foreground outline-none"
            style={{ background: "var(--card)", border: "1.5px solid var(--border)", transition: "border-color 0.15s" }}
            onFocus={e => e.currentTarget.style.borderColor = "var(--pyro-gold)"}
            onBlur={e  => e.currentTarget.style.borderColor = "var(--border)"}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-micro uppercase tracking-wider font-semibold text-muted-foreground pl-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3.5 pr-12 rounded-2xl text-body text-foreground placeholder:text-muted-foreground outline-none"
              style={{ background: "var(--card)", border: "1.5px solid var(--border)", transition: "border-color 0.15s" }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--pyro-gold)"}
              onBlur={e  => e.currentTarget.style.borderColor = "var(--border)"}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {login.error && (
          <p className="text-caption text-destructive text-center">Invalid credentials. Try again.</p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-97 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #D4920E, #C17D0A)",
            boxShadow: "0 4px 16px rgba(193,125,10,0.4)",
            marginTop: "8px",
          }}
        >
          {login.isPending ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Sign In"}
        </button>
      </form>

      <p className="text-caption text-muted-foreground text-center mt-6">
        No account?{" "}
        <Link href="/register" className="font-bold" style={{ color: "var(--pyro-gold)" }}>
          Create one
        </Link>
      </p>
    </div>
  );
}
