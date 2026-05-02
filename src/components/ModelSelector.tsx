import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Zap, Sparkles, Star, Check } from 'lucide-react';
import { PROVIDERS } from '../types';
import type { ProviderId, Model } from '../types';

interface ModelSelectorProps {
  provider: ProviderId;
  model: string;
  onProviderChange: (p: ProviderId) => void;
  onModelChange: (m: string) => void;
}

const ICONS: Record<ProviderId, React.ReactNode> = {
  groq: <Zap size={13} />,
  openai: <Sparkles size={13} />,
  gemini: <Star size={13} />,
};

const PROVIDER_COLORS: Record<ProviderId, string> = {
  groq: '#f55036',
  openai: '#10a37f',
  gemini: '#4285f4',
};

export default function ModelSelector({ provider, model, onProviderChange, onModelChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'provider' | 'model'>('provider');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;
  const currentModel = currentProvider.models.find((m) => m.id === model) ?? currentProvider.models[0];

  const handleProviderSelect = (id: ProviderId) => {
    onProviderChange(id);
    const p = PROVIDERS.find((x) => x.id === id)!;
    onModelChange(p.models[0].id);
    setTab('model');
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '7px 12px',
          background: '#1a1a1a',
          border: '1.5px solid #2a2a2a',
          borderRadius: 10,
          cursor: 'pointer',
          color: '#ddd',
          fontSize: 13,
          transition: 'border-color 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#444')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a')}
      >
        <span style={{ color: PROVIDER_COLORS[provider], display: 'flex' }}>{ICONS[provider]}</span>
        <span style={{ fontWeight: 600 }}>{currentModel.label}</span>
        <ChevronDown size={13} style={{ color: '#666', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 280,
            background: '#161616',
            border: '1px solid #222',
            borderRadius: 12,
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            zIndex: 50,
            overflow: 'hidden',
            animation: 'modalIn 0.15s ease',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #222' }}>
            {(['provider', 'model'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: tab === t ? '2px solid #10a37f' : '2px solid transparent',
                  color: tab === t ? '#eee' : '#666',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  transition: 'all 0.15s',
                }}
              >
                {t === 'provider' ? 'Provider' : 'Model'}
              </button>
            ))}
          </div>

          <div style={{ maxHeight: 280, overflowY: 'auto', padding: '6px' }}>
            {tab === 'provider' ? (
              PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProviderSelect(p.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    background: provider === p.id ? '#1e1e1e' : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: provider === p.id ? '#eee' : '#999',
                    fontSize: 13,
                    fontWeight: provider === p.id ? 600 : 400,
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={(e) => {
                    if (provider !== p.id) (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a';
                  }}
                  onMouseLeave={(e) => {
                    if (provider !== p.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  <span style={{ color: PROVIDER_COLORS[p.id], display: 'flex' }}>{ICONS[p.id]}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{p.label}</span>
                  {provider === p.id && <Check size={14} style={{ color: '#10a37f' }} />}
                </button>
              ))
            ) : (
              currentProvider.models.map((m: Model) => (
                <button
                  key={m.id}
                  onClick={() => { onModelChange(m.id); setOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    background: model === m.id ? '#1e1e1e' : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: model === m.id ? '#eee' : '#999',
                    fontSize: 13,
                    fontWeight: model === m.id ? 600 : 400,
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={(e) => {
                    if (model !== m.id) (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a';
                  }}
                  onMouseLeave={(e) => {
                    if (model !== m.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  <span style={{ flex: 1, textAlign: 'left' }}>{m.label}</span>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {m.tier === 'preview' && (
                      <span style={{ fontSize: 10, padding: '1px 5px', background: '#2a2a1a', color: '#f5a623', borderRadius: 4, fontWeight: 600 }}>
                        Preview
                      </span>
                    )}
                    {m.supportsVision && (
                      <span style={{ fontSize: 10, padding: '1px 5px', background: '#1a2a1a', color: '#10a37f', borderRadius: 4, fontWeight: 600 }}>
                        Vision
                      </span>
                    )}
                    {model === m.id && <Check size={14} style={{ color: '#10a37f' }} />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
