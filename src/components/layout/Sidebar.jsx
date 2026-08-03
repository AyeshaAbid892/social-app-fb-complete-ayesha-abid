import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';

// Icons shown right away (matches the reference panel)
const PRIMARY_LINKS = [
  { to: '/people', label: 'People You May Know', icon: '🧑‍🤝‍🧑', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
  { to: '/friends', label: 'Friends', icon: '👥', bg: 'bg-blue-100 dark:bg-blue-900/40' },
  { to: '/requests', label: 'Friend Requests', icon: '➕', bg: 'bg-gray-100 dark:bg-gray-800' },
  { to: '/professional-dashboard', label: 'Dashboard', icon: '📈', bg: 'bg-rose-100 dark:bg-rose-900/40' },
  { to: '/groups', label: 'Groups', icon: '👪', bg: 'bg-sky-100 dark:bg-sky-900/40' },
  { to: '/memories', label: 'Memories', icon: '⏰', bg: 'bg-cyan-100 dark:bg-cyan-900/40' },
  { to: '/dashboard/saved', label: 'Saved Posts', icon: '🔖', bg: 'bg-purple-100 dark:bg-purple-900/40' },
];

// Hidden behind "See more"
const MORE_LINKS = [
  { to: '/pages', label: 'Pages', icon: '📄', bg: 'bg-gray-100 dark:bg-gray-800' },
  { to: '/marketplace', label: 'Marketplace', icon: '🏪', bg: 'bg-teal-100 dark:bg-teal-900/40' },
  { to: '/videos', label: 'Videos', icon: '🎬', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
  { to: '/reels', label: 'Reels', icon: '🎞️', bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40' },
  { to: '/events', label: 'Events', icon: '📅', bg: 'bg-amber-100 dark:bg-amber-900/40' },
  { to: '/settings', label: 'Settings', icon: '⚙️', bg: 'bg-gray-100 dark:bg-gray-800' },
  { to: '/privacy', label: 'Privacy', icon: '🔒', bg: 'bg-gray-100 dark:bg-gray-800' },
  { to: '/notifications', label: 'Notifications', icon: '🔔', bg: 'bg-yellow-100 dark:bg-yellow-900/40' },
  { to: '/help', label: 'Help Center', icon: '❓', bg: 'bg-gray-100 dark:bg-gray-800' },
];

function LinkRow({ to, label, icon, bg }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-2 py-2 rounded-lg text-[15px] transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-semibold'
            : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium'
        )
      }
    >
      <span className={clsx('w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0', bg)}>
        {icon}
      </span>
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  if (!currentUser) {
    return (
      <aside className="hidden lg:block lg:w-72 flex-shrink-0">
        <div className="card p-4 sticky top-[4.5rem] text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Log in to see your shortcuts and connect with friends.
          </p>
          <NavLink
            to="/login"
            className="block w-full text-center px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Log in
          </NavLink>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block lg:w-72 flex-shrink-0">
      <nav className="sticky top-[4.5rem] space-y-0.5 max-h-[calc(100vh-5rem)] overflow-y-auto pb-4">
        <NavLink
          to={`/profile/${currentUser.id}`}
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
          <span className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 truncate">
            {currentUser.name}
          </span>
        </NavLink>

        {PRIMARY_LINKS.map((link) => (
          <LinkRow key={link.to} {...link} />
        ))}

        {expanded && MORE_LINKS.map((link) => (
          <LinkRow key={link.to} {...link} />
        ))}

        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-[15px] font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm flex-shrink-0">
            {expanded ? '▴' : '▾'}
          </span>
          {expanded ? 'See less' : 'See more'}
        </button>

        <div className="border-t border-gray-200 dark:border-gray-800 my-2" />

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-[15px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
        >
          <span className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-lg flex-shrink-0">
            🚪
          </span>
          Logout
        </button>
      </nav>
    </aside>
  );
}
