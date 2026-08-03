import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { storage } from '../utils/storage';
import { formatFullDate } from '../utils/helpers';
import Avatar from '../components/ui/Avatar';
import PostActions from '../components/post/PostActions';
import CommentSection from '../components/post/CommentSection';

export default function PostDetailPage() {
  const { postId } = useParams();
  const { getPostById, incrementViews } = usePosts();
  const post = getPostById(postId);

  useEffect(() => {
    if (postId) incrementViews(postId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (!post) {
    return <Navigate to="/404" replace />;
  }

  const author = storage.getUsers().find((u) => u.id === post.authorId);
  if (!author) return <Navigate to="/404" replace />;

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Link to={`/profile/${author.id}`}>
            <Avatar src={author.avatar} name={author.name} size="md" />
          </Link>
          <div>
            <Link
              to={`/profile/${author.id}`}
              className="font-semibold text-gray-900 dark:text-gray-100 hover:underline"
            >
              {author.name}
            </Link>
            <p className="text-xs text-gray-400">{formatFullDate(post.createdAt)}</p>
          </div>
        </div>

        {post.description && (
          <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line mb-4">
            {post.description}
          </p>
        )}

        {post.image && (
          <img
            src={post.image}
            alt="Post attachment"
            className="w-full rounded-lg mb-4 border border-gray-100 dark:border-gray-800"
          />
        )}

        <PostActions post={post} />
      </div>

      <div className="card p-5 mt-4">
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
