import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useStories } from '../../hooks/useStories';
import { storage } from '../../utils/storage';
import Avatar from '../ui/Avatar';
import CreateStoryModal from './CreateStoryModal';
import StoryViewerModal from './StoryViewerModal';

export default function StoriesBar() {
  const { currentUser } = useAuth();
  const { getGroupedStories } = useStories();
  const [creating, setCreating] = useState(false);
  const [viewingGroupIndex, setViewingGroupIndex] = useState(null);

  const groups = getGroupedStories();

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
      <button
        onClick={() => setCreating(true)}
        className="relative flex-shrink-0 w-28 h-44 rounded-xl overflow-hidden card group"
      >
        {currentUser.avatar ? (
          <img src={currentUser.avatar} alt="" className="w-full h-2/3 object-cover" />
        ) : (
          <div className="w-full h-2/3 bg-gradient-to-br from-brand-400 to-indigo-500" />
        )}
        <div className="h-1/3 flex flex-col items-center justify-end pb-2">
          <span className="absolute top-[58%] w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-lg ring-4 ring-white dark:ring-gray-900">
            +
          </span>
          <span className="text-xs font-medium text-gray-800 dark:text-gray-100 mt-2">Create story</span>
        </div>
      </button>

      {groups.map((group, index) => {
        const author = storage.getUsers().find((u) => u.id === group.authorId);
        if (!author) return null;
        const latest = group.stories[0];
        return (
          <button
            key={group.authorId}
            onClick={() => setViewingGroupIndex(index)}
            className="relative flex-shrink-0 w-28 h-44 rounded-xl overflow-hidden group"
          >
            {latest.image ? (
              <img src={latest.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center p-2">
                <p className="text-white text-xs font-medium text-center line-clamp-6">{latest.text}</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <Avatar
              src={author.avatar}
              name={author.name}
              size="sm"
              className="absolute top-2 left-2 ring-2 ring-brand-500"
            />
            <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold truncate text-left">
              {author.name}
            </span>
          </button>
        );
      })}

      <CreateStoryModal isOpen={creating} onClose={() => setCreating(false)} />
      <StoryViewerModal
        groups={groups}
        startIndex={viewingGroupIndex}
        onClose={() => setViewingGroupIndex(null)}
      />
    </div>
  );
}
