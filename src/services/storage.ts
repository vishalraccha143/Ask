import type { Chat, Message, ProviderId, ApiKeys } from '../types';

const CHATS_KEY = 'ai_chats';
const API_KEYS_KEY = 'ai_api_keys';
const PROVIDER_KEY = 'ai_provider';
const MODEL_KEY = 'ai_model';

export function saveChats(chats: Chat[]): void {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

export function loadChats(): Chat[] {
  const raw = localStorage.getItem(CHATS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Chat[];
  } catch {
    return [];
  }
}

export function saveMessages(chatId: string, messages: Message[]): void {
  localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
}

export function loadMessages(chatId: string): Message[] {
  const raw = localStorage.getItem(`chat_${chatId}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Message[];
  } catch {
    return [];
  }
}

export function deleteChat(chatId: string): void {
  localStorage.removeItem(`chat_${chatId}`);
}

export function saveApiKeys(keys: ApiKeys): void {
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(keys));
}

export function loadApiKeys(): ApiKeys {
  const raw = localStorage.getItem(API_KEYS_KEY);
  if (!raw) return { groq: '', openai: '', gemini: '' };
  try {
    return JSON.parse(raw) as ApiKeys;
  } catch {
    return { groq: '', openai: '', gemini: '' };
  }
}

export function saveProvider(provider: ProviderId): void {
  localStorage.setItem(PROVIDER_KEY, provider);
}

export function loadProvider(): ProviderId {
  return (localStorage.getItem(PROVIDER_KEY) as ProviderId) ?? 'groq';
}

export function saveModel(model: string): void {
  localStorage.setItem(MODEL_KEY, model);
}

export function loadModel(): string {
  return localStorage.getItem(MODEL_KEY) ?? 'llama-3.3-70b-versatile';
}
