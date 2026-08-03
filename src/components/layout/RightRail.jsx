import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFriends } from '../../hooks/useFriends';
import { useNotifications } from '../../hooks/useNotifications';
import { storage } from '../../utils/storage';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

export default function RightRail() {
  const { currentUser } = useAuth();
  const { getIncomingRequests, getSuggestedUsers, acceptRequest, rejectRequest, sendRequest } = useFriends();
  const { create: createNotification } = useNotifications();

  const incoming = getIncomingRequests(currentUser.id).slice(0, 3);
  const suggestions = getSuggestedUsers(currentUser.id, 4);

  const handleAccept = (request) => {
    acceptRequest(request.id);
    createNotification({
      userId: request.fromId,
      type: 'friend_request',
      message: `${currentUser.name} accepted your friend request`,
      link: `/profile/${currentUser.id}`,
    });
  };

  const handleAddFriend = (userId) => {
    sendRequest(currentUser.id, userId);
    createNotification({
      userId,
      type: 'friend_request',
      message: `${currentUser.name} sent you a friend request`,
      link: '/friend-requests',
    });
  };

  return (
    <aside className="hidden xl:block w-80 flex-shrink-0 space-y-4">
      {incoming.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Friend Requests</h3>
            <Link to="/friend-requests" className="text-xs text-brand-600 hover:underline">See all</Link>
          </div>
          <div className="space-y-3">
            {incoming.map((req) => {
              const user = storage.getUsers().find((u) => u.id === req.fromId);
              if (!user) return null;
              return (
                <div key={req.id} className="flex items-center gap-3">
                  <Link to={`/profile/${user.id}`}>
                    <Avatar src={user.avatar} name={user.name} size="md" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${user.id}`} className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:underline truncate block">
                      {user.name}
                    </Link>
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" onClick={() => handleAccept(req)}>Confirm</Button>
                      <Button size="sm" variant="secondary" onClick={() => rejectRequest(req.id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card p-4">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">Suggested Friends</h3>
        {suggestions.length === 0 && (
          <p className="text-xs text-gray-400">No suggestions right now — invite more people to join!</p>
        )}
        <div className="space-y-3">
          {suggestions.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Link to={`/profile/${user.id}`}>
                <Avatar src={user.avatar} name={user.name} size="md" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/profile/${user.id}`} className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:underline truncate block">
                  {user.name}
                </Link>
                <Button size="sm" variant="secondary" className="mt-1" onClick={() => handleAddFriend(user.id)}>
                  Add Friend
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
