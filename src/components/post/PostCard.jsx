import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../../utils/storage';
import { formatDate, truncate } from '../../utils/helpers';
import Avatar from '../ui/Avatar';
import PostActions from './PostActions';

/**
 * Renders a single post preview card.
 * Accepts a `post` object, looks up its author from localStorage,
 * and is reused on both the Feed page and the Profile page.
 */
export default function PostCard({ post }) {
  const navigate = useNavigate();
  const author = storage.getUsers().find((u) => u.id === post.authorId);

  if (!author) return null;

  const goToPost = () => navigate(`/posts/${post.id}`);

  const stopAndGoToProfile = (e) => {
    e.stopPropagation();
  };

  return (
    <article
      onClick={goToPost}
      className="card p-4 hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
    >
      <div className="flex items-center gap-3 mb-3">
        <Link to={`/profile/${author.id}`} onClick={stopAndGoToProfile}>
          <Avatar src={author.avatar} name={author.name} size="md" />
        </Link>
        <div className="min-w-0">
          <Link
            to={`/profile/${author.id}`}
            onClick={stopAndGoToProfile}
            className="font-semibold text-gray-900 dark:text-gray-100 hover:underline truncate block"
          >
            {author.name}
          </Link>
          <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
        </div>
      </div>

      {post.description && (
        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line mb-3">
          {truncate(post.description, 280)}
        </p>
      )}

      {post.image && (
        <img
          src={post.image}
          alt="Post attachment"
          className="w-full max-h-96 object-cover rounded-lg mb-3 border border-gray-100 dark:border-gray-800"
        />
      )}

      <div onClick={(e) => e.stopPropagation()}>
        <PostActions post={post} />
      </div>
    </article>
  );
}
