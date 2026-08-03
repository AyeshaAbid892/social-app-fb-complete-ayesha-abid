import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import PostCard from '../../components/post/PostCard';

export default function SavedPosts() {
  const { currentUser } = useAuth();
  const { getAllPosts } = usePosts();

  const bookmarkedIds = currentUser.bookmarks || [];
  const posts = getAllPosts().filter((p) => bookmarkedIds.includes(p.id));

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Saved Posts</h1>

      {posts.length === 0 && (
        <div className="card p-10 text-center text-gray-400">
          You haven't bookmarked any posts yet.
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
