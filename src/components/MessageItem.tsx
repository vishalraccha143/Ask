import { useState } from 'react';
import { Copy, Check, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="message-item"
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 16,
        animation: 'slideIn 0.2s ease',
      }}
    >
      <div style={{ maxWidth: '78%', position: 'relative' }} className={isUser ? '' : 'ai-message-wrapper'}>
        {/* Attachment previews */}
        {message.attachments && message.attachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
            {message.attachments.map((att) => (
              <div key={att.id} style={{ position: 'relative' }}>
                {att.type.startsWith('image/') ? (
                  <img
                    src={att.data}
                    alt={att.name}
                    style={{
                      maxWidth: 200,
                      maxHeight: 150,
                      borderRadius: 8,
                      border: '1px solid #2a2a2a',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 10px',
                      background: '#1a1a1a',
                      borderRadius: 8,
                      border: '1px solid #2a2a2a',
                      fontSize: 12,
                      color: '#aaa',
                    }}
                  >
                    <Paperclip size={12} />
                    <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {att.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            padding: '11px 15px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isUser ? '#10a37f' : '#1e1e1e',
            color: isUser ? '#fff' : '#e0e0e0',
            fontSize: 14,
            lineHeight: 1.6,
            wordBreak: 'break-word',
          }}
        >
          {isUser ? (
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && (
          <button
            onClick={handleCopy}
            className="copy-btn"
            title="Copy message"
            style={{
              position: 'absolute',
              bottom: -28,
              left: 0,
              background: 'none',
              border: '1px solid #2a2a2a',
              borderRadius: 5,
              cursor: 'pointer',
              padding: '3px 8px',
              fontSize: 11,
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s',
              opacity: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#ccc';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#444';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#666';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a';
            }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
}
