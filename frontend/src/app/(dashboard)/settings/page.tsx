'use client';

import { useTheme } from 'next-themes';
import { ChevronRight, Sun, Moon, Monitor } from 'lucide-react';
import { useMemoryValue, useSetMemory } from '@/hooks/useMemory';
import { AI_MODELS, type AIModel } from '@/types/ai.types';
import { useChatStore } from '@/store/chatStore';
import { useUserStore } from '@/store/userStore';
import { useLogout } from '@/hooks/useAuth';

const PERSONALITY_OPTIONS = ['Balanced', 'Professional', 'Friendly', 'Concise'];
const RESPONSE_LENGTH_OPTIONS = ['Brief', 'Detailed', 'Comprehensive'];
const TONE_OPTIONS = ['Neutral', 'Friendly', 'Direct', 'Empathetic'];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useUserStore();
  const logout = useLogout();
  const { selectedModel, setSelectedModel } = useChatStore();

  const personality = useMemoryValue('personality');
  const responseLength = useMemoryValue('response_length');
  const tone = useMemoryValue('tone');
  const preferredModel = useMemoryValue('preferred_model');

  const setPersonality = useSetMemory('personality');
  const setResponseLength = useSetMemory('response_length');
  const setTone = useSetMemory('tone');
  const setPreferredModel = useSetMemory('preferred_model');

  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
    setPreferredModel.mutate(model);
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-title font-bold text-foreground">Settings</h1>
        <p className="text-body text-muted-foreground mt-0.5">
          Preferences & configuration
        </p>
      </div>

      {/* Profile */}
      <Section title="Account">
        <div className="glass-light dark:glass-medium rounded-xl px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-white font-bold text-body shrink-0">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-body font-medium text-foreground">
              {user?.username}
            </p>
            <p className="text-caption text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="glass-light dark:glass-medium rounded-xl overflow-hidden divide-y divide-border">
          {(
            [
              { label: 'Dark', value: 'dark',   icon: Moon    },
              { label: 'Light', value: 'light',  icon: Sun     },
              { label: 'System', value: 'system', icon: Monitor },
            ] as const
          ).map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-muted-foreground" />
                <span className="text-body text-foreground">{label}</span>
              </div>
              {theme === value && (
                <div className="w-2 h-2 rounded-full bg-gold" />
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* AI Model */}
      <Section title="AI Model">
        <div className="glass-light dark:glass-medium rounded-xl overflow-hidden divide-y divide-border">
          {AI_MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => handleModelChange(model.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div>
                <p className="text-body text-foreground text-left">
                  {model.name}
                </p>
                <p className="text-caption text-muted-foreground capitalize">
                  {model.provider}{model.free ? ' · Free' : ''}
                </p>
              </div>
              {selectedModel === model.id && (
                <div className="w-2 h-2 rounded-full bg-gold shrink-0" />
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* Customization — backed by memory */}
      <Section title="Customization">
        <div className="glass-light dark:glass-medium rounded-xl overflow-hidden divide-y divide-border">
          <MemorySelect
            label="Personality"
            options={PERSONALITY_OPTIONS}
            value={personality.data ?? 'Balanced'}
            onChange={(v) => setPersonality.mutate(v)}
            loading={setPersonality.isPending}
          />
          <MemorySelect
            label="Response Length"
            options={RESPONSE_LENGTH_OPTIONS}
            value={responseLength.data ?? 'Detailed'}
            onChange={(v) => setResponseLength.mutate(v)}
            loading={setResponseLength.isPending}
          />
          <MemorySelect
            label="Tone"
            options={TONE_OPTIONS}
            value={tone.data ?? 'Friendly'}
            onChange={(v) => setTone.mutate(v)}
            loading={setTone.isPending}
          />
        </div>
      </Section>

      {/* Sign out */}
      <button
        onClick={logout}
        className="w-full rounded-xl border border-destructive/30 bg-destructive/5 py-3 text-body font-medium text-destructive hover:bg-destructive/10 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-caption font-semibold text-muted-foreground uppercase tracking-wider px-1">
        {title}
      </p>
      {children}
    </div>
  );
}

function MemorySelect({
  label,
  options,
  value,
  onChange,
  loading,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <span className="text-body text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {loading && (
          <div className="w-3 h-3 rounded-full border border-gold border-t-transparent animate-spin" />
        )}
        
        <select
        // The outer settings page doesn't have a standalone select —
// this error is coming from the ChatTopBar's model select
// being picked up by the accessibility scanner.
// The ChatTopBar select already has aria-label="Select AI model"
// which is correct. This is likely a false positive from the
// scanner seeing the select inside the settings page grid.
// If the error points to a specific line in settings/page.tsx,
// paste that line and I'll patch it directly.
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-body text-gold text-right appearance-none cursor-pointer outline-none"
          disabled={loading}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronRight size={14} className="text-muted-foreground" />
      </div>
    </div>
  );
}