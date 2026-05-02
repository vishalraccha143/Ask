export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // mime type
  data: string; // base64 data URL
  size: number;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export type ProviderId = 'groq' | 'openai' | 'gemini';

export interface Provider {
  id: ProviderId;
  label: string;
  icon: string;
  endpoint: string;
  models: Model[];
}

export interface Model {
  id: string;
  label: string;
  tier: 'production' | 'preview';
  supportsVision: boolean;
}

export const PROVIDERS: Provider[] = [
  {
    id: 'groq',
    label: 'Groq',
    icon: 'Zap',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', tier: 'production', supportsVision: false },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', tier: 'production', supportsVision: false },
      { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B', tier: 'production', supportsVision: true },
      { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B', tier: 'production', supportsVision: true },
      { id: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout', tier: 'preview', supportsVision: true },
      { id: 'qwen/qwen3-32b', label: 'Qwen3 32B', tier: 'preview', supportsVision: false },
    ],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    icon: 'Sparkles',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o', tier: 'production', supportsVision: true },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini', tier: 'production', supportsVision: true },
      { id: 'gpt-4.1', label: 'GPT-4.1', tier: 'production', supportsVision: true },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', tier: 'production', supportsVision: true },
      { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano', tier: 'production', supportsVision: true },
      { id: 'o3', label: 'o3', tier: 'production', supportsVision: true },
      { id: 'o4-mini', label: 'o4-mini', tier: 'production', supportsVision: true },
    ],
  },
  {
    id: 'gemini',
    label: 'Gemini',
    icon: 'Star',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    models: [
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tier: 'production', supportsVision: true },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', tier: 'production', supportsVision: true },
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', tier: 'production', supportsVision: true },
    ],
  },
];

export interface RateLimitInfo {
  remainingTokens: number | null;
  remainingRequests: number | null;
  limitTokens: number | null;
  limitRequests: number | null;
  resetTokens: string | null;
  resetRequests: string | null;
}

export interface ApiKeys {
  groq: string;
  openai: string;
  gemini: string;
}
