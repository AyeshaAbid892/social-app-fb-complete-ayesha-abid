import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { CHAT_THEMES } from '../../utils/chatThemes';
import { showToast } from '../../utils/toastBus';

export default function ChatProfilePanel({
  friend,
  nickname,
  currentTheme,
  isMuted,
  isReadReceiptsOn,
  isBlocked,
  onClose,
  onSetNickname,
  onSetTheme,
  onToggleMute,
  onToggleReadReceipts,
  onArchive,
  onDeleteChat,
  onToggleBlock,
  onReport,
}) {
  const navigate = useNavigate();
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState(nickname || '');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const saveNickname = () => {
    onSetNickname(nicknameDraft.trim());
    setEditingNickname(false);
  };

  const row = (icon, label, onClick, danger = false) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${danger ? 'text-rose-600' : 'text-gray-700 dark:text-gray-200'}`}
    >
      <span className="w-5 text-center">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed z-50 top-0 right-0 h-full w-full sm:w-80 bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-fade-in overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-gray-100">Conversation info</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">✕</button>
        </div>

        <div className="flex flex-col items-center py-6 border-b border-gray-100 dark:border-gray-800">
          <Avatar src={friend.avatar} name={friend.name} size="lg" />
          <p className="font-bold text-gray-900 dark:text-gray-100 mt-2">{nickname || friend.name}</p>
          {nickname && <p className="text-xs text-gray-400">{friend.name}</p>}
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="secondary" onClick={() => navigate(`/profile/${friend.id}`)}>View Profile</Button>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>🔒</span>
          <p>Messages are secured with end-to-end style privacy in this demo — only participants in this chat can see them. <span className="text-brand-600 dark:text-brand-400">Learn more</span></p>
        </div>

        <div className="py-2 border-b border-gray-100 dark:border-gray-800">
          {editingNickname ? (
            <div className="px-4 py-2 flex items-center gap-2">
              <input
                autoFocus
                value={nicknameDraft}
                onChange={(e) => setNicknameDraft(e.target.value)}
                placeholder={friend.name}
                className="flex-1 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button size="sm" onClick={saveNickname}>Save</Button>
            </div>
          ) : (
            row('✏️', 'Nicknames', () => setEditingNickname(true))
          )}

          <div>
            {row('🎨', `Chat theme — ${currentTheme.label}`, () => setThemeMenuOpen((o) => !o))}
            {themeMenuOpen && (
              <div className="px-4 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CHAT_THEMES.map((theme) => {
                  const active = currentTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => { onSetTheme(theme.id); setThemeMenuOpen(false); }}
                      className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all ${
                        active
                          ? 'border-brand-500 ring-2 ring-brand-500/40'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      title={theme.label}
                    >
                      <span className={`relative h-10 w-full ${theme.swatch} flex items-center justify-end px-1.5 py-1`}>
                        <span className="h-2.5 w-6 rounded-full bg-white/90 shadow-sm" />
                        {active && (
                          <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white/90 text-brand-600 text-[10px] font-bold flex items-center justify-center">✓</span>
                        )}
                      </span>
                      <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 text-center py-1 px-1 truncate bg-white dark:bg-gray-900">
                        {theme.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="py-2 border-b border-gray-100 dark:border-gray-800">
          {row(isMuted ? '🔕' : '🔔', isMuted ? 'Unmute notifications' : 'Mute notifications', onToggleMute)}
          {row('👁', `Read receipts — ${isReadReceiptsOn ? 'On' : 'Off'}`, onToggleReadReceipts)}
          {row('🗄', 'Archive chat', onArchive)}
        </div>

        <div className="py-2">
          {row('🗑', 'Delete chat', onDeleteChat, true)}
          {row('🚫', isBlocked ? 'Unblock' : 'Block', onToggleBlock, true)}
          {row('⚠️', 'Report', () => { onReport(); showToast('Report submitted — thanks for letting us know'); }, true)}
        </div>
      </div>
    </>
  );
}
