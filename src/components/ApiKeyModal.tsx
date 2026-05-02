import { useState } from 'react';
import { Eye, EyeOff, Save, X, Zap, Sparkles, Star } from 'lucide-react';
import type { ApiKeys, ProviderId } from '../types';

interface ApiKeyModalProps {
  keys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
  onClose: () => void;
}

const PROVIDER_CONFIG: { id: ProviderId; label: string; icon: React.ReactNode; placeholder: string; helpUrl: string }[] = [
  { id: 'groq', label: 'Groq', icon: <Zap size={14} />, placeholder: 'gsk_...', helpUrl: 'https://console.groq.com/keys' },
  { id: 'openai', label: 'OpenAI', icon: <Sparkles size={14} />, placeholder: 'sk-...', helpUrl: 'https://platform.openai.com/api-keys' },
  { id: 'gemini', label: 'Gemini', icon: <Star size={14} />, placeholder: 'AI...', helpUrl: 'https://aistudio.google.com/apikey' },
];

export default function ApiKeyModal({ keys, onSave, onClose }: ApiKeyModalProps) {
  const [values, setValues] = useState<ApiKeys>({ ...keys });
  const [showMap, setShowMap] = useState<Record<ProviderId, boolean>>({ groq: false, openai: false, gemini: false });
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    onSave(values);
    setSuccess(true);
    setTimeout(onClose, 800);
  };

  const hasAnyKey = Object.values(values).some((v) => v.trim().length > 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#161616',
          borderRadius: 16,
          padding: '28px 28px 24px',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'modalIn 0.2s ease',
          border: '1px solid #222',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#eee' }}>API Settings</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#555',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#eee')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#555')}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ margin: '0 0 18px', color: '#777', fontSize: 13, lineHeight: 1.5 }}>
          Add API keys for the providers you want to use. At least one key is required to start chatting.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          {PROVIDER_CONFIG.map((cfg) => (
            <div key={cfg.id}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#bbb', marginBottom: 5 }}>
                <span style={{ color: '#10a37f' }}>{cfg.icon}</span>
                {cfg.label} API Key
                <a
                  href={cfg.helpUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 11, color: '#555', fontWeight: 400, marginLeft: 'auto', textDecoration: 'none' }}
                >
                  Get key
                </a>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showMap[cfg.id] ? 'text' : 'password'}
                  value={values[cfg.id]}
                  onChange={(e) => { setValues((v) => ({ ...v, [cfg.id]: e.target.value })); setSuccess(false); }}
                  placeholder={cfg.placeholder}
                  style={{
                    width: '100%',
                    padding: '9px 40px 9px 12px',
                    border: '1.5px solid #222',
                    borderRadius: 8,
                    fontSize: 13,
                    outline: 'none',
                    color: '#eee',
                    background: '#0f0f0f',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#10a37f')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#222')}
                />
                <button
                  onClick={() => setShowMap((s) => ({ ...s, [cfg.id]: !s[cfg.id] }))}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#555',
                    display: 'flex',
                    padding: 2,
                  }}
                >
                  {showMap[cfg.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {success && (
          <p style={{ margin: '0 0 12px', color: '#10a37f', fontSize: 12 }}>API keys saved!</p>
        )}

        <button
          onClick={handleSave}
          disabled={!hasAnyKey}
          style={{
            width: '100%',
            padding: '11px',
            background: hasAnyKey ? '#10a37f' : '#222',
            color: hasAnyKey ? '#fff' : '#555',
            border: 'none',
            borderRadius: 10,
            cursor: hasAnyKey ? 'pointer' : 'not-allowed',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { if (hasAnyKey) (e.currentTarget as HTMLButtonElement).style.background = '#0e8f6f'; }}
          onMouseLeave={(e) => { if (hasAnyKey) (e.currentTarget as HTMLButtonElement).style.background = '#10a37f'; }}
        >
          <Save size={15} />
          Save Settings
        </button>
      </div>
    </div>
  );
}
