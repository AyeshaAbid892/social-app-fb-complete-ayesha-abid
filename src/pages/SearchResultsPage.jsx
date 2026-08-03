import { useSearchParams, Link } from 'react-router-dom';
import { storage } from '../utils/storage';
import { usePosts } from '../hooks/usePosts';
import PageWithSidebar from '../components/layout/PageWithSidebar';
import Avatar from '../components/ui/Avatar';
import PostCard from '../components/post/PostCard';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim().toLowerCase();
  const { getPublicPosts } = usePosts();

  const users = query
    ? storage.getUsers().filter((u) => u.name.toLowerCase().includes(query))
    : [];
  const posts = query
    ? getPublicPosts().filter((p) => p.description.toLowerCase().includes(query))
    : [];

  return (
    <PageWithSidebar>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        Search results for "{query}"
      </h1>
      <p className="text-sm text-gray-400 mb-5">
        {users.length} people · {posts.length} posts
      </p>

      {users.length === 0 && posts.length === 0 && (
        <div className="card p-10 text-center text-gray-400">No results found.</div>
      )}

      {users.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">People</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((user) => (
              <Link key={user.id} to={`/profile/${user.id}`} className="card p-3 flex items-center gap-3">
                <Avatar src={user.avatar} name={user.name} size="md" />
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {user.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div>
          <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Posts</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </PageWithSidebar>
  );
}
