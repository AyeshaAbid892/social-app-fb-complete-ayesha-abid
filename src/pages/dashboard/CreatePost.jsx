import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import { showToast } from '../../utils/toastBus';
import PostForm from '../../components/post/PostForm';

export default function CreatePost() {
  const { currentUser } = useAuth();
  const { createPost } = usePosts();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(null);

  const handleSubmit = (data, { asDraft }) => {
    setSubmitting(asDraft ? 'draft' : 'publish');
    createPost({
      authorId: currentUser.id,
      description: data.description,
      image: data.image,
      isPublic: data.isPublic,
      isDraft: asDraft,
    });

    if (asDraft) {
      // Spec: show success message and clear the form — stay right here so the
      // person can keep drafting more posts without losing their place.
      showToast('Post saved as draft');
    } else {
      showToast('Post published!');
      navigate('/');
    }
    setSubmitting(null);
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Create Post</h1>
      <div className="card p-5">
        <PostForm onSubmit={handleSubmit} submitting={submitting} resetOnDraftSave />
      </div>
    </div>
  );
}
