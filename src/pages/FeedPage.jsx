import { useState, useMemo } from 'react';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../utils/toastBus';
import PostCard from '../components/post/PostCard';
import CreatePostModal from '../components/post/CreatePostModal';
import PageWithSidebar from '../components/layout/PageWithSidebar';
import StoriesBar from '../components/stories/StoriesBar';
import Avatar from '../components/ui/Avatar';

export default function FeedPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const { getPublicPosts, version: postsVersion } = usePosts();
  const [query, setQuery] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [focusImage, setFocusImage] = useState(false);

  const posts = useMemo(() => getPublicPosts(), [getPublicPosts, postsVersion]);

  const filtered = useMemo(() => {
    if (!query.trim()) return posts;
    const q = query.toLowerCase();
    return posts.filter((p) => p.description.toLowerCase().includes(q));
  }, [posts, query]);

  const openComposer = (withImage = false) => {
    setFocusImage(withImage);
    setComposerOpen(true);
  };

  const content = (
    <div className="py-2">
      {isAuthenticated && <StoriesBar />}

      {isAuthenticated && (
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
            <button
              onClick={() => showToast('Reel creation is coming soon', 'info')}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-3 py-1.5 flex-1 justify-center"
            >
              🎬 <span className="hidden sm:inline">Reel</span>
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>No posts yet — be the first to share!</p>
        </div>
      )}

      {posts.length > 0 && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p>No results found for "{query}"</p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {isAuthenticated && (
        <CreatePostModal
          isOpen={composerOpen}
          onClose={() => setComposerOpen(false)}
          focusImage={focusImage}
        />
      )}
    </div>
  );

  if (!isAuthenticated) {
    return <div className="max-w-xl mx-auto px-4">{content}</div>;
  }

  return <PageWithSidebar showRightRail>{content}</PageWithSidebar>;
}
