import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import { formatDate, truncate } from '../../utils/helpers';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { showToast } from '../../utils/toastBus';

function statusOf(post) {
  if (post.isDraft) return 'draft';
  return post.isPublic ? 'public' : 'private';
}

export default function PostsDashboard() {
  const { currentUser } = useAuth();
  const { getUserPosts, deletePost, togglePostVisibility, publishDraft, getLikesForPost, getCommentsForPost } =
    usePosts();
  const [postToDelete, setPostToDelete] = useState(null);

  const posts = getUserPosts(currentUser.id);

  const confirmDelete = () => {
    deletePost(postToDelete.id);
    showToast('Post deleted');
    setPostToDelete(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Posts</h1>
        <Link to="/dashboard/create">
          <Button size="sm">+ New Post</Button>
        </Link>
      </div>

      {posts.length === 0 && (
        <div className="card p-10 text-center text-gray-400">
          <p className="mb-3">You haven't created any posts yet. Create your first post!</p>
          <Link to="/dashboard/create">
            <Button size="sm">Create Post</Button>
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="card p-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={statusOf(post)} />
                <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                {truncate(post.description, 120)}
              </p>
              <div className="flex gap-3 mt-2 text-xs text-gray-400">
                <span>❤️ {getLikesForPost(post.id).length}</span>
                <span>💬 {getCommentsForPost(post.id).length}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link to={`/dashboard/edit/${post.id}`}>
                <Button variant="secondary" size="sm" className="w-full">Edit</Button>
              </Link>
              {post.isDraft ? (
                <Button size="sm" onClick={() => { publishDraft(post.id); showToast('Post published'); }}>
                  Publish
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => togglePostVisibility(post.id)}
                >
                  Make {post.isPublic ? 'Private' : 'Public'}
                </Button>
              )}
              <Button variant="danger" size="sm" onClick={() => setPostToDelete(post)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        title="Delete this post?"
      >
        <p className="text-sm text-gray-500 mb-5">
          This will permanently delete the post along with its likes and comments. This can't be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setPostToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
