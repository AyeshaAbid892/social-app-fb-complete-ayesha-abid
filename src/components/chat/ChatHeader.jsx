import { useState } from 'react';
import Avatar from '../ui/Avatar';
import AIIcon from '../ui/AIIcon';
import { useNowTick } from '../../hooks/useNowTick';
import { formatDate } from '../../utils/helpers';

const PERSONALITIES = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'funny', label: 'Funny' },
];

export default function ChatHeader({
  friend,
  displayName,
  isOnline,
  lastSeen,
  onBack,
  onSearch,
  resultCount,
  aiSettings,
  onChangeAISettings,
  onOpenProfile,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  // Re-render every 30s so "Active 4m ago" keeps counting up without a storage write.
  useNowTick(30000);

  const handleSearchChange = (value) => {
    setQuery(value);
    onSearch(value);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    onSearch('');
  };

  const personalityLabel = PERSONALITIES.find((p) => p.value === aiSettings.aiPersonality)?.label || 'Friendly';

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button onClick={onBack} className="md:hidden w-8 h-8 flex items-center justify-center text-lg flex-shrink-0" aria-label="Back to conversations">
          ←
        </button>

        <button onClick={onOpenProfile} className="relative flex-shrink-0">
          <Avatar src={friend.avatar} name={friend.name} size="sm" />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <button onClick={onOpenProfile} className="font-bold text-sm text-gray-900 dark:text-gray-100 hover:underline block truncate text-left">
            {displayName || friend.name}
          </button>
          <p className="text-xs text-gray-400 truncate">
            {isOnline ? <span className="text-emerald-600 dark:text-emerald-400">Online</span> : lastSeen ? `Active ${formatDate(lastSeen)}` : 'Offline'}
            {aiSettings.aiEnabled && <span className="text-brand-500 dark:text-brand-400"> · AI: {personalityLabel}</span>}
          </p>
        </div>

        {/* AI toggle — dropdown with the 3 required options plus the bonus personality selector */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setAiMenuOpen((o) => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title="AI settings"
          >
            <AIIcon className="w-[18px] h-[18px]" />
          </button>
          {aiMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setAiMenuOpen(false)} />
              <div className="absolute z-20 right-0 top-10 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-1.5">
                <button
                  onClick={() => { onChangeAISettings({ aiEnabled: true, aiChatEnabled: false }); setAiMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  {aiSettings.aiEnabled && !aiSettings.aiChatEnabled && '✓ '}Suggest replies only
                </button>
                <button
                  onClick={() => { onChangeAISettings({ aiEnabled: true, aiChatEnabled: true }); setAiMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  {aiSettings.aiChatEnabled && '✓ '}Let AI reply for me
                </button>
                <button
                  onClick={() => { onChangeAISettings({ aiEnabled: false, aiChatEnabled: false }); setAiMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  {!aiSettings.aiEnabled && '✓ '}Turn off AI
                </button>

                <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1 px-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Personality</p>
                  <div className="grid grid-cols-2 gap-1 pb-1">
                    {PERSONALITIES.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => onChangeAISettings({ aiPersonality: p.value })}
                        className={`text-xs rounded-full px-2 py-1 border ${
                          aiSettings.aiPersonality === p.value
                            ? 'bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-900/30 dark:border-brand-700 dark:text-brand-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-500'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setSearchOpen((o) => !o)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
          title="Search in conversation"
        >
          🔍
        </button>
      </div>

      {searchOpen && (
        <div className="px-3 pb-2.5 flex items-center gap-2">
          <input
            autoFocus
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
            placeholder="Search messages…"
            className="flex-1 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {query.trim() && (
            <span className="text-xs text-gray-400 flex-shrink-0">
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </span>
          )}
          <button onClick={closeSearch} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
