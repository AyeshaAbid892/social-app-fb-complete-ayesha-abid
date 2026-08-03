import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/toastBus';
import CreatePostModal from '../post/CreatePostModal';
import CreateStoryModal from '../stories/CreateStoryModal';

const PROFESSIONAL_LINKS = [
  { label: 'Dashboard', icon: '📈', description: 'Insights, content performance and engagement', to: '/professional-dashboard' },
  { label: 'Ads Manager', icon: '📊', description: 'Create, manage and track the performance of your ads', comingSoon: true },
  { label: 'Ad Centre', icon: '📢', description: 'Manage all of the ads that you create', comingSoon: true },
];

const SOCIAL_LINKS = [
  { label: 'News Feed', icon: '🏠', description: 'See relevant posts from people you follow', to: '/' },
  { label: 'Friends', icon: '👥', description: 'Search for friends or people you may know', to: '/friends' },
  { label: 'Groups', icon: '👪', description: 'Connect with people who share your interests', to: '/groups' },
  { label: 'Events', icon: '📅', description: 'Organise or find events and things to do', to: '/events' },
  { label: 'Pages', icon: '📄', description: 'Discover and connect with businesses', to: '/pages' },
  { label: 'Marketplace', icon: '🏪', description: 'Buy and sell in your community', to: '/marketplace' },
];

const CREATE_ITEMS = [
  { label: 'Post', icon: '📝', action: 'post' },
  { label: 'Story', icon: '📖', action: 'story' },
  { label: 'Reel', icon: '🎞️', action: 'nav', to: '/reels' },
  { label: 'Life update', icon: '⭐', action: 'toast' },
  { label: 'Note', icon: '💭', action: 'toast' },
  { label: 'Page', icon: '🚩', action: 'nav', to: '/pages' },
  { label: 'Group', icon: '👪', action: 'nav', to: '/groups' },
  { label: 'Event', icon: '➕', action: 'nav', to: '/events' },
  { label: 'Marketplace Listing', icon: '🛍️', action: 'nav', to: '/marketplace' },
];

export default function MegaMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);

  if (!isOpen) return null;

  const go = (to) => {
    navigate(to);
    onClose();
  };

  const matches = (label) => label.toLowerCase().includes(search.toLowerCase());

  const handleCreateClick = (item) => {
    if (item.action === 'post') {
      setPostModalOpen(true);
      return;
    }
    if (item.action === 'story') {
      setStoryModalOpen(true);
      return;
    }
    if (item.action === 'nav') {
      go(item.to);
      return;
    }
    showToast(`${item.label} is coming soon`, 'info');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 animate-fade-in" onClick={onClose} />
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-3xl card shadow-xl p-5 animate-scale-in max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Menu</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">✕</button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu"
          className="w-full rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2 space-y-5">
            {PROFESSIONAL_LINKS.filter((l) => matches(l.label)).length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-2">Professional</h3>
                <div className="space-y-1">
                  {PROFESSIONAL_LINKS.filter((l) => matches(l.label)).map((link) => (
                    <button
                      key={link.label}
                      onClick={() =>
                        link.comingSoon
                          ? (showToast(`${link.label} is coming soon`, 'info'), onClose())
                          : go(link.to)
                      }
                      className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span>
                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{link.label}</span>
                        <span className="block text-xs text-gray-400">{link.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {SOCIAL_LINKS.filter((l) => matches(l.label)).length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-2">Social</h3>
                <div className="space-y-1">
                  {SOCIAL_LINKS.filter((l) => matches(l.label)).map((link) => (
                    <button
                      key={link.label}
                      onClick={() => go(link.to)}
                      className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span>
                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{link.label}</span>
                        <span className="block text-xs text-gray-400">{link.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-500 mb-2">Create</h3>
            <div className="space-y-1">
              {CREATE_ITEMS.filter((l) => matches(l.label)).map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleCreateClick(item)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                >
                  <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-base">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreatePostModal isOpen={postModalOpen} onClose={() => { setPostModalOpen(false); onClose(); }} />
      <CreateStoryModal isOpen={storyModalOpen} onClose={() => { setStoryModalOpen(false); onClose(); }} />
    </>
  );
}
