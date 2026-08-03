import { useState } from 'react';
import clsx from 'clsx';
import Avatar from '../ui/Avatar';
import AIIcon from '../ui/AIIcon';
import { formatDate } from '../../utils/helpers';
import MessageActionMenu from './MessageActionMenu';
import { showToast } from '../../utils/toastBus';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];

export default function MessageBubble({
  message,
  isOwn,
  friend,
  showAvatar,
  showTimestamp,
  currentUserId,
  replyToMessage,
  onToggleReaction,
  onOpenLightbox,
  onReply,
  onPin,
  onDeleteForMe,
  onDeleteForEveryone,
  highlight,
  bubbleColorClass,
  bubbleShadowClass,
  incomingBubbleClass,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // System messages (e.g. theme changes) render as a centered pill, not a bubble.
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
          {message.content}
        </span>
      </div>
    );
  }

  const reactionEntries = Object.entries(message.reactions || {}).filter(([, users]) => users.length > 0);

  const handleCopy = () => {
    navigator.clipboard?.writeText(message.content).then(() => showToast('Copied to clipboard'));
  };

  return (
    <div className={clsx('flex items-end gap-2 group', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      <div className="w-8 flex-shrink-0">
        {!isOwn && showAvatar && <Avatar src={friend.avatar} name={friend.name} size="sm" />}
      </div>

      <div className={clsx('flex flex-col max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
        <div className="relative">
          <div
            className={clsx(
              'px-4 py-2 rounded-2xl break-words whitespace-pre-line transition-colors',
              isOwn
                ? clsx(bubbleColorClass || 'bg-blue-600', bubbleShadowClass, 'text-white rounded-br-sm ml-auto')
                : clsx(incomingBubbleClass || 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100', 'rounded-bl-sm'),
              highlight && 'ring-2 ring-amber-400',
              message.deletedForEveryone && 'italic opacity-70'
            )}
          >
            {message.pinned && (
              <span className="inline-block text-[10px] mb-0.5 opacity-75" title="Pinned">📌</span>
            )}
            {message.aiGenerated && (
              <span
                className={clsx(
                  'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide mb-0.5 rounded-full px-1.5 py-0.5',
                  isOwn ? 'bg-white/15' : 'bg-brand-500/10 dark:bg-brand-400/10'
                )}
              >
                <AIIcon className="w-2.5 h-2.5" />
                AI
              </span>
            )}

            {replyToMessage && !message.deletedForEveryone && (
              <div
                className={clsx(
                  'text-xs rounded-lg px-2 py-1 mb-1.5 border-l-2 truncate max-w-[220px]',
                  isOwn ? 'bg-white/10 border-white/40' : 'bg-black/5 dark:bg-white/10 border-gray-400'
                )}
              >
                {replyToMessage.type === 'text' ? replyToMessage.content : `[${replyToMessage.type}]`}
              </div>
            )}

            {message.deletedForEveryone ? (
              <p className="text-sm">🚫 This message was deleted</p>
            ) : (
              <>
                {message.type === 'text' && <p className="text-sm">{message.content}</p>}

                {message.type === 'image' && (
                  <button onClick={() => onOpenLightbox(message.content)} className="block">
                    <img
                      src={message.content}
                      alt="Shared"
                      className="max-w-[220px] max-h-[220px] rounded-lg object-cover cursor-zoom-in"
                    />
                  </button>
                )}

                {message.type === 'video' && (
                  <video src={message.content} controls className="max-w-[240px] max-h-[240px] rounded-lg" />
                )}
              </>
            )}

            {/* Hover-to-react */}
            {!message.deletedForEveryone && (
              <button
                onClick={() => setPickerOpen((o) => !o)}
                className={clsx(
                  'absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center shadow border border-gray-200 dark:border-gray-700',
                  isOwn ? '-left-16' : '-right-16'
                )}
                title="React"
              >
                🙂
              </button>
            )}

            {/* Message actions (reply/copy/pin/delete) */}
            <div className={clsx('absolute top-1/2 -translate-y-1/2', isOwn ? '-left-8' : '-right-8')}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center shadow border border-gray-200 dark:border-gray-700"
                title="More"
              >
                ⋯
              </button>
              {menuOpen && (
                <MessageActionMenu
                  message={message}
                  isOwn={isOwn}
                  onClose={() => setMenuOpen(false)}
                  onReply={() => onReply(message)}
                  onCopy={handleCopy}
                  onPin={() => onPin(message.id)}
                  onDeleteForMe={() => onDeleteForMe(message.id)}
                  onDeleteForEveryone={() => onDeleteForEveryone(message.id)}
                />
              )}
            </div>

            {pickerOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
                <div
                  className={clsx(
                    'absolute z-20 -top-10 flex gap-1 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-2 py-1',
                    isOwn ? 'right-0' : 'left-0'
                  )}
                >
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onToggleReaction(message.id, emoji);
                        setPickerOpen(false);
                      }}
                      className="hover:scale-125 transition-transform text-base"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {reactionEntries.length > 0 && (
            <div className={clsx('flex gap-1 mt-1 flex-wrap', isOwn ? 'justify-end' : 'justify-start')}>
              {reactionEntries.map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => onToggleReaction(message.id, emoji)}
                  className={clsx(
                    'text-xs rounded-full px-1.5 py-0.5 border flex items-center gap-1',
                    users.includes(currentUserId)
                      ? 'bg-brand-50 border-brand-300 dark:bg-brand-900/30 dark:border-brand-700'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  )}
                >
                  <span>{emoji}</span>
                  <span className="text-gray-500 dark:text-gray-400">{users.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {showTimestamp && (
          <div className="flex items-center gap-1 mt-1 px-1 text-[11px] text-gray-400">
            <span>{formatDate(message.timestamp)}</span>
            {/* Bonus: read receipts — single tick once persisted ("delivered"),
                double tick once the receiver has opened the conversation. */}
            {isOwn && <span className={message.read ? 'text-brand-500' : ''}>{message.read ? '✓✓' : '✓'}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
