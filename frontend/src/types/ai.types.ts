export type AIModel =
  | 'gpt-5.5'
  | 'gpt-5.4-mini'
  | 'claude-sonnet-4-6'
  | 'claude-haiku-4-5-20251001'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-lite'
  | 'llama-3.3-70b-versatile'
  | 'llama-3.1-8b-instant';

export interface AIProviderInfo {
  id: AIModel;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'groq';
  free: boolean;
}

export const AI_MODELS: AIProviderInfo[] = [
  { id: 'gpt-5.5',                    name: 'GPT-5.5',            provider: 'openai',    free: false },
  { id: 'gpt-5.4-mini',               name: 'GPT-5.4 Mini',       provider: 'openai',    free: false },
  { id: 'claude-sonnet-4-6',          name: 'Claude Sonnet',      provider: 'anthropic', free: false },
  { id: 'claude-haiku-4-5-20251001',  name: 'Claude Haiku',       provider: 'anthropic', free: false },
  { id: 'gemini-2.5-flash',           name: 'Gemini 2.5 Flash',   provider: 'google',    free: true  },
  { id: 'gemini-2.5-flash-lite',      name: 'Gemini Flash Lite',  provider: 'google',    free: true  },
  { id: 'llama-3.3-70b-versatile',    name: 'Llama 3.3 70B',      provider: 'groq',      free: true  },
  { id: 'llama-3.1-8b-instant',       name: 'Llama 3.1 8B',       provider: 'groq',      free: true  },
];

// Dev default: Groq — free tier, fast, no billing required
export const DEFAULT_MODEL: AIModel = 'llama-3.3-70b-versatile';