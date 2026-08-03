import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useFriends } from '../../hooks/useFriends';
import { useChat } from '../../hooks/useChat';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import MegaMenu from './MegaMenu';

// Center nav icons — matches the reference layout: Home, Reels, Friends, Groups
const NAV_ICONS = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/people', label: 'People', icon: '🧑‍🤝‍🧑' },
  { to: '/friends', label: 'Friends', icon: '👥' },
  { to: '/groups', label: 'Groups', icon: '👪' },
];

export default function Navbar({ theme, onToggleTheme }) {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { getUnreadCount } = useNotifications();
  const { getIncomingRequests } = useFriends();
  const { getTotalUnreadCount } = useChat();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  const unreadNotifications = isAuthenticated ? getUnreadCount(currentUser.id) : 0;
  const pendingRequests = isAuthenticated ? getIncomingRequests(currentUser.id).length : 0;
  const unreadMessages = isAuthenticated ? getTotalUnreadCount(currentUser.id) : 0;

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-[70] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-14">
      <div className="h-full px-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Left: logo + search */}
        <div className="flex items-center gap-2 min-w-0 justify-self-start">
          <Link to="/" className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
            S
          </Link>
          <form onSubmit={handleSearch} className="relative w-full max-w-[240px] hidden sm:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search SocialConnect"
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-full pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </form>
          {isAuthenticated && (
            <button
              onClick={() => navigate('/search')}
              className="sm:hidden w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg flex-shrink-0"
              title="Search"
            >
              🔍
            </button>
          )}
        </div>

        {/* Center: main nav icons (Home, Reels, Friends, Groups) — grid-centered in the navbar */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center h-full justify-self-center">
            {NAV_ICONS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'relative w-16 lg:w-24 h-full flex items-center justify-center text-2xl transition-colors',
                    isActive
                      ? 'text-brand-600'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 rounded-lg'
                  )
                }
                title={item.label}
              >
                {({ isActive }) => (
                  <>
                    {item.icon}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-brand-600 rounded-t-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        ) : (
          <div />
        )}

        {/* Right: actions */}
        <div className="flex items-center gap-2 flex-shrink-0 justify-self-end">
          {!isAuthenticated && (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">Sign up</Button>
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Link to="/requests" className="relative hidden md:block" title="Friend Requests">
                <Button variant="secondary" size="sm" className="rounded-full font-semibold">
                  🔔 Requests
                </Button>
                {pendingRequests > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingRequests}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMegaMenuOpen(true)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg hover:brightness-95"
                title="Menu"
              >
                ⊞
              </button>

              <Link
                to="/chat"
                className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg hover:brightness-95"
                title="Chat"
              >
                💬
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Link>

              <Link
                to="/notifications"
                className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg hover:brightness-95"
                title="Notifications"
              >
                🔔
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen((o) => !o)}
                  className="flex items-center gap-1 rounded-full hover:ring-2 hover:ring-brand-200 dark:hover:ring-brand-800 transition"
                >
                  <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
                </button>

                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 card shadow-lg py-2 z-20 animate-scale-in origin-top-right">
                      <Link
                        to={`/profile/${currentUser.id}`}
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {currentUser.name}
                        </span>
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                      <Link
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        ⚙️ Settings &amp; privacy
                      </Link>
                      <Link
                        to="/help"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        ❓ Help &amp; support
                      </Link>
                      <button
                        onClick={() => {
                          onToggleTheme();
                        }}
                        className="w-full text-left flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <span>{theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}</span>
                      </button>
                      <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                      >
                        🚪 Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <MegaMenu isOpen={megaMenuOpen} onClose={() => setMegaMenuOpen(false)} />
    </header>
  );
}
