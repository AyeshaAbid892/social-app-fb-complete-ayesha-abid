import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import { fileToBase64 } from '../../utils/helpers';
import { showToast } from '../../utils/toastBus';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const PRIVACY_OPTIONS = [
  { value: 'public', label: '🌍 Public' },
  { value: 'friends', label: '👥 Friends' },
  { value: 'private', label: '🔒 Only me' },
];

export default function CreatePostModal({ isOpen, onClose, focusImage = false }) {
  const { currentUser } = useAuth();
  const { createPost } = usePosts();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [privacy, setPrivacy] = useState('public');
  const [privacyMenuOpen, setPrivacyMenuOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef(null);

  const reset = () => {
    setText('');
    setImage(null);
    setPrivacy('public');
    setPrivacyMenuOpen(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(await fileToBase64(file));
  };

  const handlePost = () => {
    if (!text.trim() && !image) return;
    setPosting(true);
    createPost({
      authorId: currentUser.id,
      description: text.trim() || ' ',
      image,
      isPublic: privacy !== 'private',
      isDraft: false,
    });
    showToast('Post shared to your feed');
    setPosting(false);
    handleClose();
  };

  const selectedPrivacy = PRIVACY_OPTIONS.find((p) => p.value === privacy);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create post">
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={currentUser?.avatar} name={currentUser?.name} size="sm" />
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{currentUser?.name}</p>
          <div className="relative">
            <button
              onClick={() => setPrivacyMenuOpen((o) => !o)}
              className="flex items-center gap-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5 text-gray-700 dark:text-gray-200"
            >
              {selectedPrivacy.label} ▾
            </button>
            {privacyMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPrivacyMenuOpen(false)} />
                <div className="absolute left-0 mt-1 w-36 card shadow-lg py-1 z-20 text-sm">
                  {PRIVACY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setPrivacy(opt.value);
                        setPrivacyMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <textarea
        autoFocus={!focusImage}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`What's on your mind, ${currentUser?.name?.split(' ')[0] || ''}?`}
        rows={image ? 3 : 6}
        className="w-full resize-none text-lg placeholder:text-gray-400 focus:outline-none bg-transparent text-gray-900 dark:text-gray-100"
      />

      {image && (
        <div className="relative mb-3">
          <img src={image} alt="Attachment preview" className="w-full max-h-72 object-cover rounded-lg" />
          <button
            onClick={() => setImage(null)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-900/80 text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Add to your post</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-lg"
            title="Photo/Video"
          >
            🖼️
          </button>
          <button
            onClick={() => showToast('Tagging people is coming soon', 'info')}
            className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-lg"
            title="Tag people"
          >
            👤
          </button>
          <button
            onClick={() => showToast('Feeling/activity is coming soon', 'info')}
            className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-lg"
            title="Feeling/activity"
          >
            😊
          </button>
          <button
            onClick={() => showToast('Location tagging is coming soon', 'info')}
            className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-lg"
            title="Check in"
          >
            📍
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
      </div>

      <Button className="w-full" disabled={!text.trim() && !image} isLoading={posting} onClick={handlePost}>
        Post
      </Button>
    </Modal>
  );
}
