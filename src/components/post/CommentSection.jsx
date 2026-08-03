import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { storage } from '../../utils/storage';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import AICommentSuggest from '../ai/AICommentSuggest';

function CommentRow({ comment, isOwner, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const author = storage.getUsers().find((u) => u.id === comment.authorId);
  if (!author) return null;

  return (
    <div className="flex gap-3 py-3">
      <Link to={`/profile/${author.id}`}>
        <Avatar src={author.avatar} name={author.name} size="sm" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2 inline-block max-w-full">
          <Link
            to={`/profile/${author.id}`}
            className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:underline"
          >
            {author.name}
          </Link>
          <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line break-words">
            {comment.text}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
          {isOwner && !confirming && (
            <button
              onClick={() => setConfirming(true)}
              className="text-xs text-gray-400 hover:text-rose-600"
            >
              Delete
            </button>
          )}
          {isOwner && confirming && (
            <span className="text-xs text-gray-500 flex items-center gap-2">
              Are you sure?
              <button
                onClick={() => onDelete(comment.id)}
                className="font-medium text-rose-600 hover:underline"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="font-medium hover:underline"
              >
                No
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ postId }) {
  const { currentUser, isAuthenticated } = useAuth();
  const { getCommentsForPost, addComment, deleteComment, getPostById } = usePosts();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue } = useForm();

  const comments = getCommentsForPost(postId);
  const post = getPostById(postId);

  const onSubmit = ({ text }) => {
    if (!text?.trim()) return;
    addComment(postId, currentUser.id, text.trim());
    reset();
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h3>

      {isAuthenticated ? (
        <div className="mb-2">
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
            <input
              {...register('text', { required: true })}
              placeholder="Write a comment..."
              className="flex-1 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button type="submit" size="sm">Post</Button>
          </form>
          {/* AI Suggest Comment — logged-in users only (we're inside the isAuthenticated branch already) */}
          {post && (
            <div className="mt-1.5 pl-1">
              <AICommentSuggest
                postDescription={post.description}
                commenterName={currentUser.name}
                postOwnerName={storage.getUsers().find((u) => u.id === post.authorId)?.name || 'the author'}
                isOwnPost={post.authorId === currentUser.id}
                onSuggestion={(comment) => setValue('text', comment)}
              />
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => navigate('/login', { state: { message: 'Please login to interact' } })}
          className="text-sm text-brand-600 hover:underline mb-2"
        >
          Login to comment
        </button>
      )}

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {comments.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
            isOwner={isAuthenticated && comment.authorId === currentUser.id}
            onDelete={deleteComment}
          />
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 py-3">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}
