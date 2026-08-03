import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFriends } from '../hooks/useFriends';
import { storage } from '../utils/storage';
import PageWithSidebar from '../components/layout/PageWithSidebar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

export default function FriendsPage() {
  const { currentUser } = useAuth();
  const { getFriendIds, removeFriend, version: friendsVersion } = useFriends();
  const [toRemove, setToRemove] = useState(null);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'recent'

  const friendIds = useMemo(
    () => getFriendIds(currentUser.id),
    [getFriendIds, currentUser.id, friendsVersion]
  );
  const allFriends = useMemo(
    () => storage.getUsers().filter((u) => friendIds.includes(u.id)),
    [friendIds]
  );

  const friends = useMemo(() => {
    const filtered = allFriends.filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase()));
    const sorted = [...filtered];
    if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    // 'recent' relies on friendIds order, which useFriends returns most-recent-accepted-first.
    if (sortBy === 'recent') sorted.sort((a, b) => friendIds.indexOf(a.id) - friendIds.indexOf(b.id));
    return sorted;
  }, [allFriends, query, sortBy, friendIds]);

  return (
    <PageWithSidebar>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Friends <span className="text-gray-400 font-normal">({allFriends.length})</span>
      </h1>

      {allFriends.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search friends"
            className="flex-1 text-sm rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="name">Sort: A–Z</option>
            <option value="recent">Sort: Recently added</option>
          </select>
        </div>
      )}

      {allFriends.length === 0 && (
        <div className="card p-10 text-center text-gray-400">
          You don't have any friends yet. Check your suggestions on the home feed!
        </div>
      )}

      {allFriends.length > 0 && friends.length === 0 && (
        <div className="card p-10 text-center text-gray-400">No friends match "{query}".</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {friends.map((friend) => (
          <div key={friend.id} className="card p-4 flex items-center gap-3">
            <Link to={`/profile/${friend.id}`}>
              <Avatar src={friend.avatar} name={friend.name} size="md" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/profile/${friend.id}`} className="font-medium text-sm text-gray-900 dark:text-gray-100 hover:underline truncate block">
                {friend.name}
              </Link>
              {friend.bio && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{friend.bio}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                <Link to={`/chat/${friend.id}`}>
                  <Button size="sm" variant="secondary">Message</Button>
                </Link>
                <button
                  onClick={() => setToRemove(friend)}
                  className="text-xs text-gray-400 hover:text-rose-600"
                >
                  Unfriend
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!toRemove} onClose={() => setToRemove(null)} title="Remove friend?">
        <p className="text-sm text-gray-500 mb-5">
          {toRemove && `${toRemove.name} will be removed from your friends list.`}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setToRemove(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => {
              removeFriend(currentUser.id, toRemove.id);
              setToRemove(null);
            }}
          >
            Remove
          </Button>
        </div>
      </Modal>
    </PageWithSidebar>
  );
}
