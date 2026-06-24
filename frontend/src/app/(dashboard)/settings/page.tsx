'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/store/userStore';
import { useLogout } from '@/hooks/useAuth';
import { memoryService } from '@/services/memory-service';
import { AI_MODELS, type AIModel } from '@/types/ai.types';
import { useChatStore } from '@/store/chatStore';
import { PageTransition } from '@/components/providers/PageTransition';
import {
  Bot,
  Sliders,
  User,
  ChevronRight,
  Brain,
  LogOut,
  Trash2,
  Check,
} from 'lucide-react';

type Tab = 'models' | 'customize' | 'account';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('models');
  const { user, accessToken } = useUserStore();
  const { selectedModel, setSelectedModel } = useChatStore();
  const logout = useLogout();
  const queryClient = useQueryClient();

  const { data: memories = [] } = useQuery({
    queryKey: ['memory'],
    queryFn: () => memoryService.getAll(accessToken!),
    enabled: !!accessToken,
  });

  const setMemory = useMutation({
    mutationFn: ({
      key,
      value,
    }: {
      key: string;
      value: Record<string, unknown>;
    }) => memoryService.set(key, value, accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memory'] }),
  });

  const clearAllMemory = useMutation({
    mutationFn: () => memoryService.clear(accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memory'] }),
  });

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model);
    setMemory.mutate({ key: 'default_model', value: { id: model } });
  };

  const getMemoryText = (key: string): string => {
    const entry = memories.find((m) => m.key === key);
    return (entry?.value as Record<string, string>)?.text ?? '';
  };

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'models',    icon: <Bot size={16} />,     label: 'AI Models' },
    { id: 'customize', icon: <Sliders size={16} />, label: 'Customize' },
    { id: 'account',   icon: <User size={16} />,    label: 'Account'   },
  ];

  return (
    <PageTransition>
      <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-title font-bold text-foreground">Settings</h1>
          <p className="text-caption text-muted-foreground mt-0.5">
            Preferences and configuration
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-4 mb-4">
          {tabs.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-caption font-medium transition-all ${
                activeTab === id
                  ? 'bg-gold text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">

          {/* ── AI MODELS ─────────────────────────────────────── */}
          {activeTab === 'models' && (
            <>
              <p className="text-caption text-muted-foreground mb-3">
                Select your default AI model. Change per-conversation from
                the chat screen.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {AI_MODELS.map((model) => {
                  const isActive = selectedModel === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model.id)}
                      className={`relative p-4 rounded-2xl text-left transition-all active:scale-[0.97] ${
                        isActive
                          ? 'bg-gold/20 border border-gold/50'
                          : 'glass-light dark:glass-medium border border-transparent'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                          isActive ? 'bg-gold/30' : 'bg-white/10'
                        }`}
                      >
                        <Bot
                          size={18}
                          className={isActive ? 'text-gold' : 'text-muted-foreground'}
                        />
                      </div>
                      <p
                        className={`text-caption font-semibold ${
                          isActive ? 'text-gold' : 'text-foreground'
                        }`}
                      >
                        {model.name}
                      </p>
                      <p className="text-micro text-muted-foreground mt-0.5">
                        {model.provider.charAt(0).toUpperCase() +
                          model.provider.slice(1)}
                        {model.free && ' · Free'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── CUSTOMIZE ─────────────────────────────────────── */}
          {activeTab === 'customize' && (
            <>
              <p className="text-caption text-muted-foreground mb-3">
                These preferences are stored in memory and influence how
                Pyrobot responds.
              </p>

              {[
                {
                  key: 'personality',
                  label: 'Personality',
                  hint: 'e.g. Friendly, Professional, Concise',
                },
                {
                  key: 'tone',
                  label: 'Tone',
                  hint: 'e.g. Casual, Formal, Encouraging',
                },
                {
                  key: 'response_length',
                  label: 'Response Length',
                  hint: 'e.g. Brief, Detailed, Balanced',
                },
              ].map(({ key, label, hint }) => (
                <div
                  key={key}
                  className="glass-light dark:glass-medium rounded-2xl px-4 py-4 space-y-2"
                >
                  <p className="text-body font-medium text-foreground">
                    {label}
                  </p>
                  <input
                    type="text"
                    defaultValue={getMemoryText(key)}
                    placeholder={hint}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) {
                        setMemory.mutate({ key, value: { text: val } });
                      }
                    }}
                    className="w-full bg-transparent text-body text-foreground placeholder:text-muted-foreground outline-none border-b border-white/10 focus:border-gold/50 pb-1 transition-colors"
                  />
                </div>
              ))}

              {/* Memory section */}
              <div className="glass-light dark:glass-medium rounded-2xl px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain size={18} className="text-gold" />
                    <div>
                      <p className="text-body font-medium text-foreground">
                        Memory
                      </p>
                      <p className="text-micro text-muted-foreground">
                        {memories.length}{' '}
                        {memories.length === 1 ? 'entry' : 'entries'} stored
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Clear all memory? This cannot be undone.')) {
                        clearAllMemory.mutate();
                      }
                    }}
                    disabled={
                      clearAllMemory.isPending || memories.length === 0
                    }
                    className="flex items-center gap-1.5 text-caption text-destructive hover:opacity-70 disabled:opacity-40 transition-opacity"
                  >
                    <Trash2 size={14} />
                    Clear all
                  </button>
                </div>

                {memories.length > 0 && (
                  <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
                    {memories.map((m) => (
                      <div
                        key={m.key}
                        className="flex items-start gap-2 py-1 border-t border-white/5"
                      >
                        <span className="text-caption text-gold font-medium min-w-[100px]">
                          {m.key}
                        </span>
                        <span className="text-caption text-muted-foreground truncate">
                          {JSON.stringify(m.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── ACCOUNT ───────────────────────────────────────── */}
          {activeTab === 'account' && (
            <>
              {/* Profile card */}
              <div className="glass-light dark:glass-medium rounded-2xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center shrink-0">
                  <span className="text-title font-bold text-white">
                    {user?.username?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-heading font-bold text-foreground truncate">
                    {user?.username}
                  </p>
                  <p className="text-caption text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  <p className="text-micro text-gold mt-1">
                    Pyrobot AI Assistant
                  </p>
                </div>
              </div>

              {/* Quick-nav rows */}
              <div className="space-y-2">
                <SettingsRow
                  icon={<Brain size={18} className="text-gold" />}
                  label="Memory"
                  value={`${memories.length} entries`}
                  onClick={() => setActiveTab('customize')}
                />
                <SettingsRow
                  icon={<Bot size={18} className="text-gold" />}
                  label="Default Model"
                  value={
                    AI_MODELS.find((m) => m.id === selectedModel)?.name ??
                    selectedModel
                  }
                  onClick={() => setActiveTab('models')}
                />
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="w-full glass-light dark:glass-medium rounded-2xl px-4 py-4 flex items-center gap-3 text-destructive active:scale-[0.98] transition-transform mt-2"
              >
                <LogOut size={18} />
                <span className="text-body font-medium">Sign out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full glass-light dark:glass-medium rounded-2xl px-4 py-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
    >
      {icon}
      <span className="flex-1 text-body text-foreground">{label}</span>
      <span className="text-caption text-muted-foreground">{value}</span>
      <ChevronRight size={16} className="text-muted-foreground shrink-0" />
    </button>
  );
}