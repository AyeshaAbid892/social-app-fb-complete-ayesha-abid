import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useStories } from '../../hooks/useStories';
import { storage } from '../../utils/storage';
import { formatDate } from '../../utils/helpers';
import Avatar from '../ui/Avatar';

const EMOJIS = ['❤️', '😂', '😮', '😢', '👍'];

export default function StoryViewerModal({ groups, startIndex, onClose }) {
  const { currentUser } = useAuth();
  const { deleteStory, reactToStory } = useStories();
  const [groupIndex, setGroupIndex] = useState(startIndex);
  const [storyIndex, setStoryIndex] = useState(0);

  useEffect(() => {
    setGroupIndex(startIndex);
    setStoryIndex(0);
  }, [startIndex]);

  if (startIndex === null || startIndex === undefined || !groups[groupIndex]) return null;

  const group = groups[groupIndex];
  const story = group.stories[storyIndex];
  const author = storage.getUsers().find((u) => u.id === group.authorId);
  if (!author || !story) return null;

  const isOwner = story.authorId === currentUser.id;

  const goNext = () => {
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      setGroupIndex((i) => i - 1);
      setStoryIndex(0);
    }
  };

  const handleDelete = () => {
    deleteStory(story.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
      >
        ✕
      </button>

      <button onClick={goPrev} className="absolute left-4 text-white text-3xl w-10 h-10 hidden sm:flex items-center justify-center">
        ‹
      </button>
      <button onClick={goNext} className="absolute right-4 text-white text-3xl w-10 h-10 hidden sm:flex items-center justify-center">
        ›
      </button>

      <div className="w-full max-w-sm h-[80vh] rounded-xl overflow-hidden relative">
        {/* progress segments */}
        <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
          {group.stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
              <div className={`h-full bg-white ${i <= storyIndex ? 'w-full' : 'w-0'}`} />
            </div>
          ))}
        </div>

        <div className="absolute top-6 left-3 right-3 z-10 flex items-center gap-2">
          <Avatar src={author.avatar} name={author.name} size="sm" />
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{author.name}</p>
            <p className="text-white/70 text-xs">{formatDate(story.createdAt)}</p>
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="ml-auto text-white/80 text-xs bg-black/30 rounded-full px-3 py-1 hover:bg-black/50"
            >
              Delete
            </button>
          )}
        </div>

        {story.image ? (
          <img src={story.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center p-8">
            <p className="text-white text-xl font-semibold text-center">{story.text}</p>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-2 z-10">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => reactToStory(story.id, currentUser.id, emoji)}
              className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center text-lg hover:bg-black/50 hover:scale-110 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
