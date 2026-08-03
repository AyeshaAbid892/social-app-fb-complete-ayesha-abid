import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import { showToast } from '../../utils/toastBus';
import PostForm from '../../components/post/PostForm';

export default function EditPost() {
  const { postId } = useParams();
  const { currentUser } = useAuth();
  const { getPostById, updatePost } = usePosts();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(null);

  const post = getPostById(postId);

  // Guard: if the post doesn't exist or doesn't belong to this user, bounce back
  if (!post || post.authorId !== currentUser.id) {
    return <Navigate to="/dashboard/posts" replace />;
  }

  const handleSubmit = (data, { asDraft }) => {
    setSubmitting(asDraft ? 'draft' : 'publish');
    updatePost(post.id, {
      description: data.description,
      image: data.image,
      isPublic: data.isPublic,
      isDraft: asDraft,
    });

    if (asDraft) {
      showToast('Post saved as draft');
      navigate('/dashboard/posts');
    } else {
      showToast('Post published!');
      navigate('/');
    }
    setSubmitting(null);
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Edit Post</h1>
      <div className="card p-5">
        <PostForm defaultValues={post} onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
}
