import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFriends } from '../hooks/useFriends';
import { useNotifications } from '../hooks/useNotifications';
import { storage } from '../utils/storage';
import PageWithSidebar from '../components/layout/PageWithSidebar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';

const TABS = [
  { key: 'incoming', label: 'Received' },
  { key: 'outgoing', label: 'Sent' },
];

export default function FriendRequestsPage() {
  const { currentUser } = useAuth();
  const { getIncomingRequests, getOutgoingRequests, acceptRequest, rejectRequest, cancelRequest } = useFriends();
  const { create: createNotification } = useNotifications();
  const [tab, setTab] = useState('incoming');

  const incoming = getIncomingRequests(currentUser.id);
  const outgoing = getOutgoingRequests(currentUser.id);

  const handleAccept = (req) => {
    acceptRequest(req.id);
    createNotification({
      userId: req.fromId,
      type: 'friend_request',
      message: `${currentUser.name} accepted your friend request`,
      link: `/profile/${currentUser.id}`,
    });
  };

  const list = tab === 'incoming' ? incoming : outgoing;

  return (
    <PageWithSidebar>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Friend Requests</h1>

      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t.label} ({t.key === 'incoming' ? incoming.length : outgoing.length})
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <div className="card p-10 text-center text-gray-400">
          {tab === 'incoming' ? 'No pending friend requests.' : "You haven't sent any requests."}
        </div>
      )}

      <div className="space-y-3">
        {list.map((req) => {
          const otherId = tab === 'incoming' ? req.fromId : req.toId;
          const user = storage.getUsers().find((u) => u.id === otherId);
          if (!user) return null;
          return (
            <div key={req.id} className="card p-4 flex items-center gap-3">
              <Link to={`/profile/${user.id}`}>
                <Avatar src={user.avatar} name={user.name} size="md" />
              </Link>
              <Link to={`/profile/${user.id}`} className="flex-1 min-w-0 font-medium text-sm text-gray-900 dark:text-gray-100 hover:underline truncate">
                {user.name}
              </Link>
              {tab === 'incoming' ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAccept(req)}>Accept</Button>
                  <Button size="sm" variant="secondary" onClick={() => rejectRequest(req.id)}>Reject</Button>
                </div>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => cancelRequest(req.id)}>Cancel Request</Button>
              )}
            </div>
          );
        })}
      </div>
    </PageWithSidebar>
  );
}
