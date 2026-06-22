'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { registerSchema, type RegisterValues } from '@/lib/validations/auth';
import { useRegister } from '@/hooks/useAuth';

export function RegisterForm() {
  const register_ = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '' },
  });

  const onSubmit = (values: RegisterValues) => register_.mutate(values);

  return (
    <div className="glass-medium rounded-3xl p-8 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-xl bg-gold flex items-center justify-center">
          <span className="text-micro font-bold text-white">P</span>
        </div>
        <span className="text-heading font-bold text-foreground">
          Pyrobot <span className="text-gold">✦</span>
        </span>
      </div>

      <h1 className="text-title font-bold text-foreground mb-1">
        Create account
      </h1>
      <p className="text-caption text-muted-foreground mb-8">
        Your AI. Your way. Starting now.
      </p>

      {register_.isError && (
        <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
          <p className="text-caption text-destructive">
            {register_.error instanceof Error
              ? register_.error.message
              : 'Something went wrong. Please try again.'}
        </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Username */}
        <div className="space-y-1">
          <label htmlFor="username" className="text-caption text-muted-foreground">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            disabled={register_.isPending}
            className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-body text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-gold disabled:opacity-50 ${
              errors.username ? 'border-destructive' : 'border-white/10'
            }`}
            placeholder="yourname"
            {...register('username')}
          />
          {errors.username && (
            <p className="text-micro text-destructive">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-caption text-muted-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            disabled={register_.isPending}
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
            autoComplete="new-password"
            disabled={register_.isPending}
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

        <button
          type="submit"
          disabled={register_.isPending}
          className="w-full rounded-xl bg-gold py-3 flex items-center justify-center gap-2 text-body font-semibold text-white disabled:opacity-70 active:scale-[0.98] transition-all"
        >
          {register_.isPending && <Loader2 size={16} className="animate-spin" />}
          {register_.isPending ? 'Creating account…' : 'Get started'}
        </button>
      </form>

      <p className="text-caption text-muted-foreground text-center mt-6">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-gold hover:text-gold-light transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}