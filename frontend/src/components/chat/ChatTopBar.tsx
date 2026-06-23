'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreHorizontal, ChevronDown } from 'lucide-react';
import { AI_MODELS, type AIModel } from '@/types/ai.types';
import { useChatStore } from '@/store/chatStore';

export function ChatTopBar() {
  const router = useRouter();
  const { selectedModel, setSelectedModel } = useChatStore();
  // currentModel removed — select uses selectedModel directly

  return (
    <div className="shrink-0 glass-dark border-b border-border">
      {/* Title row */}
      <div className="h-14 flex items-center justify-between px-4">
        <button
          onClick={() => router.push('/chat')}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to chats"
        >
          <ArrowLeft size={20} />
        </button>

        <span className="text-body font-semibold text-foreground">
          Chat with Pyrobot{' '}
          <span className="text-gold" aria-hidden="true">✦</span>
        </span>

        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Model selector pill */}
      <div className="pb-3 flex justify-center relative">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as AIModel)}
          className="rounded-full bg-white/10 border border-white/20 px-4 py-1 text-caption font-medium text-foreground cursor-pointer appearance-none text-center pr-6"
          aria-label="Select AI model"
        >
          {AI_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}{model.free ? ' (free)' : ''}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-[calc(50%-40px)] top-[9px] text-muted-foreground pointer-events-none"
        />
      </div>
    </div>
  );
}