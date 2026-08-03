import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Toaster from './components/ui/Toaster';
import RequireAuth from './components/routing/RequireAuth';
import RedirectIfAuthed from './components/routing/RedirectIfAuthed';
import { storage } from './utils/storage';
import { useAuth } from './hooks/useAuth';
import { usePresenceHeartbeat } from './hooks/usePresenceHeartbeat';

// Every page is lazy-loaded so each route is its own JS chunk.
const FeedPage = lazy(() => import('./pages/FeedPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const FriendRequestsPage = lazy(() => import('./pages/FriendRequestsPage'));
const PeoplePage = lazy(() => import('./pages/PeoplePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage'));
const ProfessionalDashboardPage = lazy(() => import('./pages/ProfessionalDashboardPage'));

const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const PostsDashboard = lazy(() => import('./pages/dashboard/PostsDashboard'));
const CreatePost = lazy(() => import('./pages/dashboard/CreatePost'));
const EditPost = lazy(() => import('./pages/dashboard/EditPost'));
const ProfileSettings = lazy(() => import('./pages/dashboard/ProfileSettings'));
const SavedPosts = lazy(() => import('./pages/dashboard/SavedPosts'));

function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Shorthand for the many "not built yet, but really navigates here" modules
// from the wider Social Connect spec (groups, marketplace, reels, etc).
function comingSoon(props) {
  return (
    <RequireAuth>
      <ComingSoonPage {...props} />
    </RequireAuth>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => storage.getTheme());
  const { currentUser } = useAuth();
  usePresenceHeartbeat(currentUser?.id);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    storage.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1">
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            <Route path="/" element={<FeedPage />} />

            {/* Auth */}
            <Route path="/login" element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
            <Route path="/signup" element={<RedirectIfAuthed><SignupPage /></RedirectIfAuthed>} />
            <Route path="/forgot-password" element={<RedirectIfAuthed><ForgotPasswordPage /></RedirectIfAuthed>} />
            <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />

            {/* Public content */}
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/search" element={<RequireAuth><SearchResultsPage /></RequireAuth>} />

            {/* Friends system */}
            <Route path="/people" element={<RequireAuth><PeoplePage /></RequireAuth>} />
            <Route path="/friends" element={<RequireAuth><FriendsPage /></RequireAuth>} />
            <Route path="/friend-requests" element={<RequireAuth><FriendRequestsPage /></RequireAuth>} />
            {/* /requests is the canonical path per the Assignment 2 spec; /friend-requests is
                kept as an alias so nothing that already links to it (Navbar, RightRail) breaks. */}
            <Route path="/requests" element={<RequireAuth><FriendRequestsPage /></RequireAuth>} />

            {/* Real-time chat */}
            <Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />
            <Route path="/chat/:userId" element={<RequireAuth><ChatPage /></RequireAuth>} />
            {/* /messenger was Assignment 1's "coming soon" placeholder for this exact
                feature — now that it's built, redirect old links straight to it. */}
            <Route path="/messenger" element={<Navigate to="/chat" replace />} />

            {/* Notifications */}
            <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />

            {/* Settings */}
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <SettingsPage theme={theme} onToggleTheme={toggleTheme} />
                </RequireAuth>
              }
            />

            {/* Professional dashboard (real analytics derived from own posts/likes/comments/friends) */}
            <Route path="/professional-dashboard" element={<RequireAuth><ProfessionalDashboardPage /></RequireAuth>} />

            {/* Modules planned but not yet built — still real, dedicated routes */}
            <Route path="/groups" element={comingSoon({ title: 'Groups', icon: '👪', description: 'Create, join, and manage groups here soon.' })} />
            <Route path="/pages" element={comingSoon({ title: 'Pages', icon: '📄' })} />
            <Route path="/marketplace" element={comingSoon({ title: 'Marketplace', icon: '🏪' })} />
            <Route path="/memories" element={comingSoon({ title: 'Memories', icon: '⏰' })} />
            <Route path="/videos" element={comingSoon({ title: 'Videos', icon: '🎬' })} />
            <Route path="/reels" element={comingSoon({ title: 'Reels', icon: '🎞️', description: 'Reel creation and a full-screen player are next up.' })} />
            <Route path="/events" element={comingSoon({ title: 'Events', icon: '📅' })} />
            <Route path="/privacy" element={comingSoon({ title: 'Privacy Center', icon: '🔒', description: 'Deeper privacy controls live under Settings → Privacy for now.' })} />
            <Route path="/help" element={comingSoon({ title: 'Help Center', icon: '❓' })} />

            {/* Post management dashboard */}
            <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
              <Route index element={<PostsDashboard />} />
              <Route path="posts" element={<PostsDashboard />} />
              <Route path="create" element={<CreatePost />} />
              <Route path="edit/:postId" element={<EditPost />} />
              <Route path="saved" element={<SavedPosts />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
