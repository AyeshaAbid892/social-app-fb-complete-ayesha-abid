import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { storage } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { useFriends } from '../hooks/useFriends';
import { showToast } from '../utils/toastBus';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileAboutCard from '../components/profile/ProfileAboutCard';
import AboutSection from '../components/profile/AboutSection';
import PostCard from '../components/post/PostCard';
import CreatePostModal from '../components/post/CreatePostModal';
import PageWithSidebar from '../components/layout/PageWithSidebar';
import Avatar from '../components/ui/Avatar';

const TABS = ['Posts', 'About', 'Photos', 'Friends', 'Videos', 'Reels', 'Groups', 'Saved', 'Activity Log'];

function ComingSoonTab({ label }) {
  return (
    <div className="card p-10 text-center text-gray-400">
      <p className="text-3xl mb-2">🚧</p>
      {label} is on the roadmap for the next build phase.
    </div>
  );
}

export default function ProfilePage() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const { getUserPublicPosts, getUserPosts, getAllPosts } = usePosts();
  const { getFriendIds } = useFriends();
  const [tab, setTab] = useState('Posts');
  const [postView, setPostView] = useState('list');
  const [composerOpen, setComposerOpen] = useState(false);
  const [focusImage, setFocusImage] = useState(false);

  const openComposer = (withImage = false) => {
    setFocusImage(withImage);
    setComposerOpen(true);
  };

  const user = storage.getUsers().find((u) => u.id === userId);
  if (!user) return <Navigate to="/404" replace />;

  const isOwner = currentUser?.id === userId;
  const posts = isOwner ? getUserPosts(userId) : getUserPublicPosts(userId);

  const photoPosts = getAllPosts().filter((p) => p.authorId === userId && p.image && (isOwner || (p.isPublic && !p.isDraft)));
  const friendIds = getFriendIds(userId);
  const friends = storage.getUsers().filter((u) => friendIds.includes(u.id));

  const postsColumn = (
    <>
      {isOwner && (
        <div className="card p-3 mb-4">
          <div className="flex items-center gap-2">
            <Avatar src={currentUser.avatar} name={currentUser.name} size="md" />
            <button
              onClick={() => openComposer(false)}
              className="flex-1 text-left bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full px-4 py-2.5 text-sm text-gray-500 transition-colors"
            >
              What's on your mind, {currentUser.name.split(' ')[0]}?
            </button>
          </div>
          <div className="flex items-center justify-around mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => showToast('Live video is coming soon', 'info')}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-3 py-1.5 flex-1 justify-center"
            >
              🎥 <span className="hidden sm:inline">Live video</span>
            </button>
            <button
              onClick={() => openComposer(true)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-3 py-1.5 flex-1 justify-center"
            >
              🖼️ <span className="hidden sm:inline">Photo/video</span>
            </button>
            <Link
              to="/dashboard/create"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-3 py-1.5 flex-1 justify-center"
            >
              🎬 <span className="hidden sm:inline">Reel</span>
            </Link>
          </div>
        </div>
      )}

      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Posts</h3>
          {isOwner && (
            <Link to="/dashboard/posts">
              <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                ⚙️ Manage posts
              </button>
            </Link>
          )}
        </div>

        {posts.length > 0 && (
          <div className="flex justify-end gap-1 mt-3">
            <button
              onClick={() => setPostView('list')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg ${postView === 'list' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              ☰ List view
            </button>
            <button
              onClick={() => setPostView('grid')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg ${postView === 'grid' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              ▦ Grid view
            </button>
          </div>
        )}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-gray-400 py-10">
          {isOwner ? "You haven't posted anything yet" : 'No public posts yet'}
        </p>
      )}

      {posts.length > 0 && (
        postView === 'list' ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {posts.map((post) => (
              <Link key={post.id} to={`/posts/${post.id}`} className="aspect-square rounded-lg overflow-hidden card flex items-center justify-center p-2">
                {post.image ? (
                  <img src={post.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-xs text-gray-500 line-clamp-6">{post.description}</p>
                )}
              </Link>
            ))}
          </div>
        )
      )}
    </>
  );

  return (
    <PageWithSidebar fluid>
      <div className="max-w-5xl mx-auto">
        <ProfileHeader user={user} isOwner={isOwner} />

        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800 mb-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Posts' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <ProfileAboutCard user={user} isOwner={isOwner} />
            <div className="flex-1 min-w-0 w-full">{postsColumn}</div>
          </div>
        )}

        {tab !== 'Posts' && (
          <div className="max-w-2xl mx-auto">
            {tab === 'About' && <AboutSection user={user} isOwner={isOwner} />}

            {tab === 'Photos' && (
              <>
                {photoPosts.length === 0 ? (
                  <ComingSoonTab label="No photos yet" />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {photoPosts.map((post) => (
                      <Link key={post.id} to={`/posts/${post.id}`} className="aspect-square rounded-lg overflow-hidden">
                        <img src={post.image} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'Friends' && (
              <>
                {friends.length === 0 ? (
                  <ComingSoonTab label="No friends yet" />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {friends.map((friend) => (
                      <Link key={friend.id} to={`/profile/${friend.id}`} className="card p-3 flex items-center gap-2">
                        <Avatar src={friend.avatar} name={friend.name} size="sm" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {friend.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'Videos' && <ComingSoonTab label="Videos" />}
            {tab === 'Reels' && <ComingSoonTab label="Reels" />}
            {tab === 'Groups' && <ComingSoonTab label="Groups" />}
            {tab === 'Saved' && <ComingSoonTab label="Saved posts (see Dashboard → Saved Posts for the working version)" />}
            {tab === 'Activity Log' && <ComingSoonTab label="Activity log" />}
          </div>
        )}
      </div>

      {isOwner && (
        <CreatePostModal
          isOpen={composerOpen}
          onClose={() => setComposerOpen(false)}
          focusImage={focusImage}
        />
      )}
    </PageWithSidebar>
  );
}
