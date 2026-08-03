import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';

/**
 * Like + comment-count row. Used inside PostCard and PostDetailPage.
 * Guests can see the buttons but get redirected to /login on click.
 */
export default function PostActions({ post }) {
  const { currentUser, isAuthenticated, updateCurrentUser } = useAuth();
  const { getLikesForPost, hasUserLiked, toggleLike, getCommentsForPost, toggleBookmark } = usePosts();
  const navigate = useNavigate();

  const likeCount = getLikesForPost(post.id).length;
  const commentCount = getCommentsForPost(post.id).length;
  const liked = isAuthenticated && hasUserLiked(post.id, currentUser.id);
  const bookmarked = isAuthenticated && (currentUser.bookmarks || []).includes(post.id);

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please login to interact' } });
      return;
    }
    toggleLike(post.id, currentUser.id);
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please login to interact' } });
      return;
    }
    navigate(`/posts/${post.id}`);
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please login to interact' } });
      return;
    }
    toggleBookmark(post.id, currentUser, updateCurrentUser);
  };

  return (
    <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-800 mt-1">
      <button
        onClick={handleLike}
        className={clsx(
          'flex items-center gap-1.5 text-sm font-medium transition-colors',
          liked ? 'text-rose-600' : 'text-gray-500 hover:text-rose-600 dark:text-gray-400'
        )}
      >
        <span>{liked ? '❤️' : '🤍'}</span>
        {likeCount}
      </button>

      <button
        onClick={handleComment}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-600 dark:text-gray-400 transition-colors"
      >
        💬 {commentCount}
      </button>

      <button
        onClick={handleBookmark}
        className={clsx(
          'ml-auto flex items-center gap-1.5 text-sm font-medium transition-colors',
          bookmarked ? 'text-amber-500' : 'text-gray-500 hover:text-amber-500 dark:text-gray-400'
        )}
        aria-label="Bookmark post"
      >
        {bookmarked ? '🔖' : '📑'}
      </button>
    </div>
  );
}
