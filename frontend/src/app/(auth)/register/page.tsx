import Link from 'next/link';

export default function RegisterPage() {
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

      {/* Stage 5.2: real form + backend wiring */}
      <div className="space-y-4">
        <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
          <p className="text-caption text-muted-foreground">Username</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
          <p className="text-caption text-muted-foreground">Email</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
          <p className="text-caption text-muted-foreground">Password</p>
        </div>
        <div className="w-full rounded-xl bg-gold py-3 text-center">
          <span className="text-body font-semibold text-white">Get started</span>
        </div>
      </div>

      <p className="text-caption text-muted-foreground text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-gold hover:text-gold-light transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}