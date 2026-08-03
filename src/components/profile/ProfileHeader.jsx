import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatFullDate, fileToBase64 } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { useFriends } from '../../hooks/useFriends';
import { useNotifications } from '../../hooks/useNotifications';
import { showToast } from '../../utils/toastBus';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import RelationshipButton from '../friends/RelationshipButton';

export default function ProfileHeader({ user, isOwner }) {
  const { currentUser, updateCurrentUser } = useAuth();
  const {
    getFriendIds,
    getRelationshipStatus,
    getRequestBetween,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
  } = useFriends();
  const { create: createNotification } = useNotifications();
  const [uploading, setUploading] = useState(null); // 'coverImage' | 'avatar' | null

  const friendCount = getFriendIds(user.id).length;

  // Only relevant when viewing someone else's profile — see the relationship
  // table in the assignment spec (Add Friend / Request Sent / Accept+Reject / Message+Unfriend).
  const relationship = !isOwner && currentUser ? getRelationshipStatus(currentUser.id, user.id) : null;
  const pendingRequest = !isOwner && currentUser ? getRequestBetween(currentUser.id, user.id) : null;

  const handleAddFriend = () => {
    sendRequest(currentUser.id, user.id);
    createNotification({
      userId: user.id,
      type: 'friend_request',
      message: `${currentUser.name} sent you a friend request`,
      link: '/requests',
    });
  };

  const handleAccept = () => {
    if (!pendingRequest) return;
    acceptRequest(pendingRequest.id);
    createNotification({
      userId: user.id,
      type: 'friend_request',
      message: `${currentUser.name} accepted your friend request`,
      link: `/profile/${currentUser.id}`,
    });
  };

  const handleReject = () => {
    if (!pendingRequest) return;
    rejectRequest(pendingRequest.id);
  };

  const handleUnfriend = () => {
    removeFriend(currentUser.id, user.id);
    showToast(`Removed ${user.name} from your friends`);
  };

  const handleFileChange = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    const base64 = await fileToBase64(file);
    updateCurrentUser({ [field]: base64 });
    showToast(field === 'coverImage' ? 'Cover photo updated' : 'Profile photo updated');
    setUploading(null);
  };

  return (
    <div className="card overflow-hidden mb-4">
      <div
        className="h-40 sm:h-64 bg-gradient-to-r from-brand-400 to-indigo-500 relative"
        style={
          user.coverImage
            ? { backgroundImage: `url(${user.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
      >
        {isOwner && (
          <label className="absolute bottom-3 right-3 cursor-pointer">
            <span className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs font-medium px-3 py-2 rounded-lg shadow flex items-center gap-1.5">
              📷 {uploading === 'coverImage' ? 'Uploading...' : 'Edit cover photo'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'coverImage')}
            />
          </label>
        )}
      </div>
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-10">
          <div className="relative">
            <Avatar
              src={user.avatar}
              name={user.name}
              size="lg"
              className="ring-4 ring-white dark:ring-gray-900"
            />
            {isOwner && (
              <label className="absolute -bottom-1 -right-1 cursor-pointer w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs shadow">
                📷
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'avatar')}
                />
              </label>
            )}
          </div>
          {isOwner && (
            <Link to="/dashboard/settings" className="mb-1">
              <Button variant="secondary" size="sm">Edit Profile</Button>
            </Link>
          )}
          {relationship && (
            <div className="mb-1">
              <RelationshipButton
                relationship={relationship}
                onAddFriend={handleAddFriend}
                onAccept={handleAccept}
                onReject={handleReject}
                onUnfriend={handleUnfriend}
                messageHref={`/chat/${user.id}`}
              />
            </div>
          )}
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-3">{user.name}</h1>
        {user.profession && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.profession}</p>
        )}
        {user.bio && <p className="text-gray-600 dark:text-gray-300 mt-1">{user.bio}</p>}

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-500 dark:text-gray-400">
          {user.location && <span>📍 {user.location}</span>}
          <span>🗓️ Joined {formatFullDate(user.joinedAt)}</span>
        </div>

        <div className="flex gap-4 mt-3 text-sm">
          <span>
            <strong className="text-gray-900 dark:text-gray-100">{friendCount}</strong>{' '}
            <span className="text-gray-500">Friends</span>
          </span>
        </div>
      </div>
    </div>
  );
}
