export default function MemoriesPage() {
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-title font-bold text-foreground">Memory</h1>
        <p className="text-body text-muted-foreground mt-1">
          What Pyrobot knows about you
        </p>
      </div>

      {/* Empty state — replaced in Stage 5.4 with real memory list */}
      <div className="glass-light dark:glass-medium rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-xl leading-none">🧠</span>
        </div>
        <p className="text-body font-medium text-foreground mb-1">No memories yet</p>
        <p className="text-caption text-muted-foreground">
          Start chatting and Pyrobot will start building context about you.
        </p>
      </div>
    </div>
  );
}