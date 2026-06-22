export default function SettingsPage() {
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-title font-bold text-foreground">Settings</h1>
        <p className="text-body text-muted-foreground mt-1">
          Preferences and configuration
        </p>
      </div>

      {/* Settings rows — wired in Stage 5.4 */}
      <div className="space-y-2">
        {[
          { label: 'Appearance', hint: 'Theme · Stage 5.4' },
          { label: 'Default Model', hint: 'AI provider · Stage 5.4' },
          { label: 'Account', hint: 'Profile · Stage 5.4' },
          { label: 'Memory', hint: 'Clear all · Stage 5.4' },
        ].map(({ label, hint }) => (
          <div
            key={label}
            className="glass-light dark:glass-medium rounded-xl px-4 py-4 flex items-center justify-between"
          >
            <span className="text-body text-foreground">{label}</span>
            <span className="text-caption text-muted-foreground">{hint}</span>
          </div>
        ))}
      </div>
    </div>
  );
}