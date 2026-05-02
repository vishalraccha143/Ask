import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { Send, Loader, MessageSquare, Zap, Clock, Paperclip, X, Image, FileText } from 'lucide-react';
import MessageItem from './MessageItem';
import ModelSelector from './ModelSelector';
import type { Message, ModelId, RateLimitInfo, Attachment, ProviderId } from '../types';

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  error: string;
  hasAnyKey: boolean;
  provider: ProviderId;
  model: string;
  rateLimit: RateLimitInfo | null;
  onProviderChange: (p: ProviderId) => void;
  onModelChange: (m: string) => void;
  onSend: (text: string, attachments?: Attachment[]) => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  currentModelSupportsVision: boolean;
}

function formatResetTime(resetStr: string | null): string {
  if (!resetStr) return '';
  const match = resetStr.match(/^(\d+)m([\d.]+)s$/);
  if (match) {
    const mins = parseInt(match[1]);
    const secs = parseFloat(match[2]);
    if (mins > 0) return `${mins}m ${Math.round(secs)}s`;
    return `${secs.toFixed(1)}s`;
  }
  const msMatch = resetStr.match(/^([\d.]+)ms$/);
  if (msMatch) return `${parseFloat(msMatch[1]).toFixed(0)}ms`;
  const sMatch = resetStr.match(/^([\d.]+)s$/);
  if (sMatch) return `${parseFloat(sMatch[1]).toFixed(1)}s`;
  return resetStr;
}

function formatNumber(n: number | null): string {
  if (n === null) return '--';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

const ACCEPTED_TYPES = [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/pdf',
  'text/plain', 'text/csv', 'text/markdown',
  'application/json',
  'text/html', 'text/css',
  'text/javascript', 'application/javascript',
  'text/x-python', 'application/x-python-code',
];

export default function ChatWindow({
  messages,
  loading,
  error,
  hasAnyKey,
  provider,
  model,
  rateLimit,
  onProviderChange,
  onModelChange,
  onSend,
  onOpenSettings,
  onToggleSidebar,
  currentModelSupportsVision,
}: ChatWindowProps) {
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    const text = draft.trim();
    if ((!text && attachments.length === 0) || loading || !hasAnyKey) return;
    setDraft('');
    onSend(text || 'Describe the attached file(s).', attachments.length > 0 ? attachments : undefined);
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type) && !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const att: Attachment = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          type: file.type,
          data: reader.result as string,
          size: file.size,
        };
        setAttachments((prev) => [...prev, att]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const isEmpty = messages.length === 0;

  const tokenPercent = rateLimit?.limitTokens && rateLimit.remainingTokens !== null
    ? Math.max(0, (rateLimit.remainingTokens / rateLimit.limitTokens) * 100) : null;
  const requestPercent = rateLimit?.limitRequests && rateLimit.remainingRequests !== null
    ? Math.max(0, (rateLimit.remainingRequests / rateLimit.limitRequests) * 100) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', background: '#0a0a0a', minWidth: 0 }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderBottom: '1px solid #1a1a1a', background: '#0a0a0a', zIndex: 10, gap: 12, flexShrink: 0,
      }}>
        <button onClick={onToggleSidebar} className="hamburger-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 5, borderRadius: 6, display: 'none', flexDirection: 'column', gap: 4, flexShrink: 0 }}
          title="Toggle sidebar"
        >
          <span style={{ display: 'block', width: 18, height: 2, background: '#666', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 18, height: 2, background: '#666', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 18, height: 2, background: '#666', borderRadius: 2 }} />
        </button>

        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#eee', flex: 1 }}>Osama</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ModelSelector provider={provider} model={model} onProviderChange={onProviderChange} onModelChange={onModelChange} />
          {!hasAnyKey && (
            <button onClick={onOpenSettings}
              style={{ padding: '7px 14px', background: '#10a37f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'background 0.15s', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#0e8f6f')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#10a37f')}
            >
              Add API Key
            </button>
          )}
        </div>
      </header>

      {/* Rate Limit Bar */}
      {rateLimit && hasAnyKey && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20, padding: '8px 20px',
          background: '#0f0f0f', borderBottom: '1px solid #1a1a1a', fontSize: 11, color: '#666', flexShrink: 0, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={11} style={{ color: '#10a37f' }} />
            <span style={{ color: '#999' }}>Tokens</span>
            <span style={{ color: '#eee', fontWeight: 600 }}>{formatNumber(rateLimit.remainingTokens)}</span>
            <span style={{ color: '#444' }}>/</span>
            <span style={{ color: '#888' }}>{formatNumber(rateLimit.limitTokens)}</span>
            {tokenPercent !== null && (
              <div style={{ width: 50, height: 3, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${tokenPercent}%`, height: '100%',
                  background: tokenPercent > 50 ? '#10a37f' : tokenPercent > 20 ? '#f5a623' : '#e55',
                  borderRadius: 2, transition: 'width 0.3s',
                }} />
              </div>
            )}
            {rateLimit.resetTokens && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#555' }}>
                <Clock size={9} /> {formatResetTime(rateLimit.resetTokens)}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#999' }}>Requests</span>
            <span style={{ color: '#eee', fontWeight: 600 }}>{formatNumber(rateLimit.remainingRequests)}</span>
            <span style={{ color: '#444' }}>/</span>
            <span style={{ color: '#888' }}>{formatNumber(rateLimit.limitRequests)}</span>
            {requestPercent !== null && (
              <div style={{ width: 50, height: 3, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${requestPercent}%`, height: '100%',
                  background: requestPercent > 50 ? '#10a37f' : requestPercent > 20 ? '#f5a623' : '#e55',
                  borderRadius: 2, transition: 'width 0.3s',
                }} />
              </div>
            )}
            {rateLimit.resetRequests && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#555' }}>
                <Clock size={9} /> {formatResetTime(rateLimit.resetRequests)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: isEmpty ? 0 : '24px 20px 8px',
        display: isEmpty ? 'flex' : 'block', alignItems: 'center', justifyContent: 'center',
      }}>
        {isEmpty ? (
          <div style={{ textAlign: 'center', color: '#444', padding: 32 }}>
            <MessageSquare size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.25 }} />
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#666' }}>Start a conversation</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#444' }}>
              {hasAnyKey ? 'Type a message or attach files to begin.' : 'Add an API key to start chatting.'}
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => <MessageItem key={msg.id} message={msg} />)}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', fontSize: 13, marginBottom: 16 }}>
                <Loader size={14} className="spin" /> AI is thinking...
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          margin: '0 20px 8px', padding: '10px 14px', background: '#1f1215',
          border: '1px solid #3a1a1a', borderRadius: 8, color: '#e55', fontSize: 13, flexShrink: 0,
        }}>
          {error}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #1a1a1a', background: '#0a0a0a', flexShrink: 0 }}>
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {attachments.map((att) => (
              <div key={att.id} style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 8px 5px 6px', background: '#161616', borderRadius: 8,
                border: '1px solid #222', fontSize: 12, color: '#aaa',
              }}>
                {att.type.startsWith('image/') ? (
                  <>
                    <img src={att.data} alt={att.name} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />
                    <Image size={11} style={{ color: '#10a37f' }} />
                  </>
                ) : (
                  <FileText size={14} style={{ color: '#f5a623' }} />
                )}
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                <button onClick={() => removeAttachment(att.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0, display: 'flex', lineHeight: 1 }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#e55')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#555')}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          background: '#141414', borderRadius: 14, padding: '8px 10px 8px 6px',
          border: '1.5px solid #1e1e1e', transition: 'border-color 0.15s',
        }}
          onFocusCapture={(e) => (e.currentTarget.style.borderColor = '#10a37f')}
          onBlurCapture={(e) => (e.currentTarget.style.borderColor = '#1e1e1e')}
        >
          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!hasAnyKey || loading}
            style={{
              background: 'none', border: 'none', cursor: hasAnyKey ? 'pointer' : 'not-allowed',
              color: hasAnyKey ? '#555' : '#333', padding: 6, borderRadius: 8, display: 'flex',
              transition: 'color 0.15s', flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (hasAnyKey) (e.currentTarget as HTMLButtonElement).style.color = '#10a37f'; }}
            onMouseLeave={(e) => { if (hasAnyKey) (e.currentTarget as HTMLButtonElement).style.color = '#555'; }}
            title={currentModelSupportsVision ? 'Attach image, PDF, or file' : 'Attach file (current model does not support vision)'}
          >
            <Paperclip size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(',')}
            style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
          />

          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            disabled={!hasAnyKey || loading}
            placeholder={hasAnyKey ? 'Message... (Enter to send, Shift+Enter for new line)' : 'Add an API key to start chatting'}
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none',
              fontSize: 14, color: '#eee', lineHeight: 1.6, padding: '4px 0', fontFamily: 'inherit',
              cursor: hasAnyKey ? 'text' : 'not-allowed', opacity: hasAnyKey ? 1 : 0.3,
            }}
          />
          <button
            onClick={handleSend}
            disabled={(!draft.trim() && attachments.length === 0) || loading || !hasAnyKey}
            style={{
              background: (draft.trim() || attachments.length > 0) && !loading && hasAnyKey ? '#10a37f' : '#1e1e1e',
              border: 'none', borderRadius: 10,
              cursor: (draft.trim() || attachments.length > 0) && !loading && hasAnyKey ? 'pointer' : 'not-allowed',
              color: (draft.trim() || attachments.length > 0) && !loading && hasAnyKey ? '#fff' : '#444',
              padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s',
            }}
          >
            {loading ? <Loader size={16} className="spin" /> : <Send size={16} />}
          </button>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#333', textAlign: 'center' }}>
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
