import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { formatDate } from '../utils/helpers';
import PageWithSidebar from '../components/layout/PageWithSidebar';
import Button from '../components/ui/Button';

const TYPE_ICON = {
  like: '❤️',
  comment: '💬',
  share: '🔁',
  friend_request: '👥',
  group_invite: '👪',
  message: '✉️',
  mention: '📣',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'friend_request', label: 'Friend Requests' },
  { key: 'like', label: 'Likes' },
  { key: 'comment', label: 'Comments' },
];

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const { getForUser, markAsRead, markAllAsRead, remove } = useNotifications();
  const [filter, setFilter] = useState('all');

  const all = getForUser(currentUser.id);
  const filtered = all.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  return (
    <PageWithSidebar>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
        {all.some((n) => !n.read) && (
          <Button size="sm" variant="secondary" onClick={() => markAllAsRead(currentUser.id)}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center text-gray-400">No notifications here.</div>
      )}

      <div className="space-y-2">
        {filtered.map((n) => {
          const Wrapper = n.link ? Link : 'div';
          const linkProps = n.link ? { to: n.link } : {};
          return (
            <Wrapper
              key={n.id}
              {...linkProps}
              onClick={() => !n.read && markAsRead(n.id)}
              className={`card p-4 flex items-start gap-3 ${!n.read ? 'border-brand-300 dark:border-brand-700' : ''}`}
            >
              <span className="text-xl">{TYPE_ICON[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-100">{n.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(n.createdAt)}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(n.id);
                }}
                className="text-gray-300 hover:text-rose-600 text-sm flex-shrink-0"
              >
                ✕
              </button>
            </Wrapper>
          );
        })}
      </div>
    </PageWithSidebar>
  );
}
