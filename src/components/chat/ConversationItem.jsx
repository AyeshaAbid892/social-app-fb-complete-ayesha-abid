import clsx from 'clsx';
import Avatar from '../ui/Avatar';
import { formatDate } from '../../utils/helpers';
import { formatMessagePreview } from '../../utils/chatHelpers';

export default function ConversationItem({ conversation, isActive, isOnline, onClick }) {
  const { friend, lastMessage, unreadCount } = conversation;

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
        isActive ? 'bg-blue-50 border-l-4 border-blue-600 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar src={friend.avatar} name={friend.name} size="md" />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{friend.name}</span>
          {lastMessage && (
            <span className="text-[11px] text-gray-400 flex-shrink-0">{formatDate(lastMessage.timestamp)}</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {lastMessage ? formatMessagePreview(lastMessage) : 'Say hello 👋'}
          </span>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[1.25rem] text-center flex-shrink-0">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
