export default function ChatPage() {
  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-10rem)] px-4 py-6">
      {/* Empty state — replaced in Stage 5.3 with real message list */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto">
            <span className="text-2xl leading-none">✦</span>
          </div>
          <div>
            <h2 className="text-heading font-semibold text-foreground mb-1">
              Good to see you
            </h2>
            <p className="text-body text-muted-foreground">
              Start a conversation and Pyrobot will remember what matters.
            </p>
          </div>
        </div>
      </div>

      {/* Input bar placeholder — replaced in Stage 5.3 */}
      <div className="mt-6">
        <div className="glass-light dark:glass-medium rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="flex-1 text-body text-muted-foreground select-none">
            Ask anything…
          </span>
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-body leading-none">↑</span>
          </div>
        </div>
      </div>
    </div>
  );
}