import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ApiKeyModal from './components/ApiKeyModal';
import {
  saveChats, loadChats,
  saveMessages, loadMessages, deleteChat as deleteStorageChat,
  saveApiKeys, loadApiKeys,
  saveProvider, loadProvider,
  saveModel, loadModel,
} from './services/storage';
import { sendMessage } from './services/groq';
import { PROVIDERS } from './types';
import type { Chat, Message, ProviderId, RateLimitInfo, Attachment, ApiKeys } from './types';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createNewChat(): Chat {
  const now = Date.now();
  return { id: generateId(), title: 'New Chat', createdAt: now, updatedAt: now };
}

export default function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ groq: '', openai: '', gemini: '' });
  const [provider, setProvider] = useState<ProviderId>('groq');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);

  const hasAnyKey = !!(apiKeys.groq || apiKeys.openai || apiKeys.gemini);

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;
  const currentModelObj = currentProvider.models.find((m) => m.id === model);
  const currentModelSupportsVision = currentModelObj?.supportsVision ?? false;

  useEffect(() => {
    const savedKeys = loadApiKeys();
    const savedProvider = loadProvider();
    const savedModel = loadModel();
    const savedChats = loadChats();

    setApiKeys(savedKeys);
    setProvider(savedProvider);
    setModel(savedModel);

    if (savedChats.length > 0) {
      setChats(savedChats);
      const latest = [...savedChats].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      setActiveChatId(latest.id);
      setMessages(loadMessages(latest.id));
    } else {
      const initial = createNewChat();
      setChats([initial]);
      setActiveChatId(initial.id);
      saveChats([initial]);
    }

    if (!savedKeys.groq && !savedKeys.openai && !savedKeys.gemini) setShowModal(true);
  }, []);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChatId(id);
    setMessages(loadMessages(id));
    setError('');
    setSidebarOpen(false);
  }, []);

  const handleNewChat = useCallback(() => {
    const chat = createNewChat();
    setChats((prev) => {
      const updated = [...prev, chat];
      saveChats(updated);
      return updated;
    });
    setActiveChatId(chat.id);
    setMessages([]);
    setError('');
    setSidebarOpen(false);
  }, []);

  const handleDeleteChat = useCallback((id: string) => {
    deleteStorageChat(id);
    setChats((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (id === activeChatId) {
        if (updated.length > 0) {
          const next = [...updated].sort((a, b) => b.updatedAt - a.updatedAt)[0];
          setActiveChatId(next.id);
          setMessages(loadMessages(next.id));
          saveChats(updated);
          return updated;
        } else {
          const fresh = createNewChat();
          const withFresh = [fresh];
          saveChats(withFresh);
          setActiveChatId(fresh.id);
          setMessages([]);
          return withFresh;
        }
      }
      saveChats(updated);
      return updated;
    });
  }, [activeChatId]);

  const handleSaveApiKeys = useCallback((keys: ApiKeys) => {
    setApiKeys(keys);
    saveApiKeys(keys);
  }, []);

  const handleProviderChange = useCallback((p: ProviderId) => {
    setProvider(p);
    saveProvider(p);
  }, []);

  const handleModelChange = useCallback((m: string) => {
    setModel(m);
    saveModel(m);
  }, []);

  const handleSend = useCallback(async (text: string, attachments?: Attachment[]) => {
    if (!activeChatId || !hasAnyKey) return;

    const key = apiKeys[provider];
    if (!key) {
      setError(`No API key set for ${currentProvider.label}. Add it in Settings.`);
      return;
    }

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveMessages(activeChatId, updatedMessages);

    setChats((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== activeChatId) return c;
        const title = c.title === 'New Chat'
          ? text.slice(0, 40) + (text.length > 40 ? '...' : '')
          : c.title;
        return { ...c, title, updatedAt: Date.now() };
      });
      saveChats(updated);
      return updated;
    });

    setLoading(true);
    setError('');

    try {
      const result = await sendMessage(updatedMessages, key, currentProvider, model, currentModelSupportsVision);
      setRateLimit(result.rateLimit);

      const aiMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: result.content,
        timestamp: Date.now(),
      };
      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      saveMessages(activeChatId, finalMessages);
      setChats((prev) => {
        const updated = prev.map((c) =>
          c.id === activeChatId ? { ...c, updatedAt: Date.now() } : c
        );
        saveChats(updated);
        return updated;
      });
    } catch (err: unknown) {
      let msg = 'Something went wrong. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { error?: { message?: string } }; status?: number; headers?: Record<string, string> } }).response;
        if (res?.headers) {
          setRateLimit({
            remainingTokens: res.headers['x-ratelimit-remaining-tokens'] ? parseInt(res.headers['x-ratelimit-remaining-tokens']) : null,
            remainingRequests: res.headers['x-ratelimit-remaining-requests'] ? parseInt(res.headers['x-ratelimit-remaining-requests']) : null,
            limitTokens: res.headers['x-ratelimit-limit-tokens'] ? parseInt(res.headers['x-ratelimit-limit-tokens']) : null,
            limitRequests: res.headers['x-ratelimit-limit-requests'] ? parseInt(res.headers['x-ratelimit-limit-requests']) : null,
            resetTokens: res.headers['x-ratelimit-reset-tokens'] ?? null,
            resetRequests: res.headers['x-ratelimit-reset-requests'] ?? null,
          });
        }
        if (res?.status === 401) msg = `Invalid API key for ${currentProvider.label}. Please check your key in Settings.`;
        else if (res?.status === 429) msg = 'Rate limit exceeded. Please wait and try again.';
        else if (res?.data?.error?.message) msg = res.data.error.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeChatId, hasAnyKey, apiKeys, provider, currentProvider, model, messages]);

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#0a0a0a',
    }}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onOpenSettings={() => setShowModal(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatWindow
        messages={messages}
        loading={loading}
        error={error}
        hasAnyKey={hasAnyKey}
        provider={provider}
        model={model}
        rateLimit={rateLimit}
        onProviderChange={handleProviderChange}
        onModelChange={handleModelChange}
        onSend={handleSend}
        onOpenSettings={() => setShowModal(true)}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        currentModelSupportsVision={currentModelSupportsVision}
      />

      {showModal && (
        <ApiKeyModal
          keys={apiKeys}
          onSave={handleSaveApiKeys}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
