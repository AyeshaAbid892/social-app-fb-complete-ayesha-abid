import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useStories } from '../../hooks/useStories';
import { fileToBase64 } from '../../utils/helpers';
import { showToast } from '../../utils/toastBus';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function CreateStoryModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const { createStory } = useStories();
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(await fileToBase64(file));
  };

  const reset = () => {
    setImage(null);
    setText('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = () => {
    if (!image && !text.trim()) return;
    createStory({ authorId: currentUser.id, image, text: text.trim() });
    showToast('Story posted');
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Story">
      <div className="space-y-4">
        {image ? (
          <div className="relative">
            <img src={image} alt="Story preview" className="w-full h-64 object-cover rounded-lg" />
            <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-900/80 text-white flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="w-full h-40 rounded-lg bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center p-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={150}
              placeholder="What's on your mind?"
              className="w-full h-full bg-transparent text-white placeholder:text-white/70 text-center font-medium resize-none focus:outline-none"
            />
          </div>
        )}

        <label className="block">
          <span className="text-sm text-gray-600 dark:text-gray-300">Upload image (optional)</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block mt-1 text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-900/30 dark:file:text-brand-300"
          />
        </label>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!image && !text.trim()}>Share to Story</Button>
        </div>
      </div>
    </Modal>
  );
}
