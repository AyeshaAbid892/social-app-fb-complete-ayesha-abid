import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';

const LINKS = [
  { to: '/dashboard/posts', label: 'My Posts', icon: '📝' },
  { to: '/dashboard/create', label: 'Create Post', icon: '➕' },
  { to: '/dashboard/saved', label: 'Saved Posts', icon: '🔖' },
  { to: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout() {
  return (
    <div className="max-w-5xl mx-auto py-6 px-4 flex gap-6">
      <aside className="w-48 flex-shrink-0 hidden sm:block">
        <nav className="card p-2 sticky top-20 space-y-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around py-2">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              clsx('text-xs flex flex-col items-center gap-0.5', isActive ? 'text-brand-600' : 'text-gray-500')
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1 min-w-0 pb-16 sm:pb-0">
        <Outlet />
      </div>
    </div>
  );
}
