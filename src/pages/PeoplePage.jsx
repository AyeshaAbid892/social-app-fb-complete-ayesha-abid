import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFriends } from '../hooks/useFriends';
import { useNotifications } from '../hooks/useNotifications';
import { truncate } from '../utils/helpers';
import PageWithSidebar from '../components/layout/PageWithSidebar';
import Avatar from '../components/ui/Avatar';
import RelationshipButton from '../components/friends/RelationshipButton';

export default function PeoplePage() {
  const { currentUser } = useAuth();
  const {
    getPeopleYouMayKnow,
    sendRequest,
    acceptRequest,
    rejectRequest,
  } = useFriends();
  const { create: createNotification } = useNotifications();

  // Sorted: incoming requests first, then no-connection, then already-requested —
  // see getPeopleYouMayKnow in useFriends.js for why the ordering lives there.
  const people = getPeopleYouMayKnow(currentUser.id);

  const handleAddFriend = (userId) => {
    sendRequest(currentUser.id, userId);
    createNotification({
      userId,
      type: 'friend_request',
      message: `${currentUser.name} sent you a friend request`,
      link: '/requests',
    });
  };

  const handleAccept = (entry) => {
    acceptRequest(entry.requestId);
    createNotification({
      userId: entry.user.id,
      type: 'friend_request',
      message: `${currentUser.name} accepted your friend request`,
      link: `/profile/${currentUser.id}`,
    });
  };

  return (
    <PageWithSidebar>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">People You May Know</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        People on SocialConnect you're not connected with yet.
      </p>

      {people.length === 0 && (
        <div className="card p-10 text-center text-gray-400">
          No suggestions right now — invite more people to join!
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {people.map((entry) => (
          <div key={entry.user.id} className="card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${entry.user.id}`}>
                <Avatar src={entry.user.avatar} name={entry.user.name} size="md" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/profile/${entry.user.id}`}
                  className="font-medium text-sm text-gray-900 dark:text-gray-100 hover:underline truncate block"
                >
                  {entry.user.name}
                </Link>
                {entry.user.bio && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {truncate(entry.user.bio, 60)}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {entry.mutualCount} mutual {entry.mutualCount === 1 ? 'friend' : 'friends'}
                </p>
              </div>
            </div>

            <RelationshipButton
              relationship={entry.relationship}
              onAddFriend={() => handleAddFriend(entry.user.id)}
              onAccept={() => handleAccept(entry)}
              onReject={() => rejectRequest(entry.requestId)}
            />
          </div>
        ))}
      </div>
    </PageWithSidebar>
  );
}
