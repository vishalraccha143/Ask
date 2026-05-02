import { Plus, MessageSquare, Trash2, Settings, X } from 'lucide-react';
import type { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onOpenSettings,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
            display: 'none',
          }}
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}
      <aside
        style={{
          width: 260,
          background: '#111',
          color: '#ccc',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexShrink: 0,
          transition: 'transform 0.25s ease',
          borderRight: '1px solid #1e1e1e',
        }}
        className={`sidebar${isOpen ? ' sidebar-open' : ''}`}
      >
        <div style={{ padding: '14px 12px 10px' }}>
          <button
            onClick={onNewChat}
            className="new-chat-btn"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: '#10a37f',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          {chats.length === 0 && (
            <p style={{ textAlign: 'center', color: '#444', fontSize: 13, marginTop: 24 }}>
              No conversations yet
            </p>
          )}
          {[...chats].sort((a, b) => b.updatedAt - a.updatedAt).map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                background: activeChatId === chat.id ? '#1e1e1e' : 'transparent',
                marginBottom: 2,
                transition: 'background 0.15s',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                if (activeChatId !== chat.id)
                  (e.currentTarget as HTMLDivElement).style.background = '#181818';
              }}
              onMouseLeave={(e) => {
                if (activeChatId !== chat.id)
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
              }}
            >
              <MessageSquare size={14} style={{ flexShrink: 0, color: '#555' }} />
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: activeChatId === chat.id ? '#eee' : '#999',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {chat.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#444',
                  padding: 3,
                  borderRadius: 4,
                  display: 'flex',
                  transition: 'color 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#e55')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#444')}
                title="Delete chat"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: '1px solid #1e1e1e',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={onOpenSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#777',
              fontSize: 13,
              padding: '6px 8px',
              borderRadius: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#eee';
              (e.currentTarget as HTMLButtonElement).style.background = '#1e1e1e';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#777';
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            <Settings size={15} />
            Settings
          </button>

          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#555',
              padding: 4,
              borderRadius: 4,
              display: 'none',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
