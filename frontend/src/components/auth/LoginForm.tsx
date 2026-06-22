'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { loginSchema, type LoginValues } from '@/lib/validations/auth';
import { useLogin } from '@/hooks/useAuth';

export function LoginForm() {
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginValues) => login.mutate(values);

  return (
    <div className="glass-medium rounded-3xl p-8 w-full max-w-sm">
      {/* Logo mark */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-xl bg-gold flex items-center justify-center">
          <span className="text-micro font-bold text-white">P</span>
        </div>
        <span className="text-heading font-bold text-foreground">
          Pyrobot <span className="text-gold">✦</span>
        </span>
      </div>

      <h1 className="text-title font-bold text-foreground mb-1">
        Welcome back
      </h1>
      <p className="text-caption text-muted-foreground mb-8">
        Sign in to your account
      </p>

      {/* API error banner */}
      {login.isError && (
        <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
          <p className="text-caption text-destructive">
            {login.error instanceof Error
              ? login.error.message
              : 'Something went wrong. Please try again.'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-caption text-muted-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            disabled={login.isPending}
            className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-body text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-gold disabled:opacity-50 ${
              errors.email ? 'border-destructive' : 'border-white/10'
            }`}
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-micro text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label htmlFor="password" className="text-caption text-muted-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={login.isPending}
            className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-body text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-gold disabled:opacity-50 ${
              errors.password ? 'border-destructive' : 'border-white/10'
            }`}
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-micro text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-xl bg-gold py-3 flex items-center justify-center gap-2 text-body font-semibold text-white disabled:opacity-70 active:scale-[0.98] transition-all"
        >
          {login.isPending && <Loader2 size={16} className="animate-spin" />}
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-caption text-muted-foreground text-center mt-6">
        No account?{' '}
        <Link
          href="/register"
          className="text-gold hover:text-gold-light transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}