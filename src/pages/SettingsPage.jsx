import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { fileToBase64 } from '../utils/helpers';
import { showToast } from '../utils/toastBus';
import PageWithSidebar from '../components/layout/PageWithSidebar';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { storage } from '../utils/storage';

const MAX_BIO = 150;

const TABS = [
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'account', label: 'Account & Password', icon: '🔑' },
  { key: 'privacy', label: 'Privacy', icon: '🔒' },
  { key: 'security', label: 'Security', icon: '🛡️' },
  { key: 'notifications', label: 'Notifications', icon: '🔔' },
  { key: 'theme', label: 'Theme', icon: '🌓' },
  { key: 'language', label: 'Language', icon: '🌐' },
];

function ProfileSettingsTab() {
  const { currentUser, updateCurrentUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      name: currentUser.name,
      bio: currentUser.bio || '',
      location: currentUser.location || '',
      profession: currentUser.profession || '',
    },
  });
  const bio = watch('bio') || '';

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(await fileToBase64(file));
  };

  const onSubmit = (data) => {
    updateCurrentUser({ ...data, avatar: avatarPreview });
    showToast('Profile updated successfully');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar src={avatarPreview} name={currentUser.name} size="lg" />
        <label className="text-sm text-brand-600 font-medium cursor-pointer">
          Change photo
          <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </label>
      </div>
      <Input label="Full Name" {...register('name', { required: true })} />
      <Input label="Profession" {...register('profession')} />
      <div>
        <Input textarea label="Bio" maxLength={MAX_BIO} {...register('bio')} />
        <p className="text-xs text-gray-400 mt-1 text-right">{bio.length} / {MAX_BIO}</p>
      </div>
      <Input label="Location" {...register('location')} />
      <Button type="submit">Save Changes</Button>
    </form>
  );
}

function AccountSettingsTab() {
  const { currentUser, updateCurrentUser } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = ({ currentPassword, newPassword }) => {
    const users = storage.getUsers();
    const match = users.find((u) => u.id === currentUser.id && u.password === currentPassword);
    if (!match) {
      showToast('Current password is incorrect', 'error');
      return;
    }
    updateCurrentUser({ password: newPassword });
    showToast('Password updated successfully');
    reset();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">Email</h3>
        <p className="text-sm text-gray-500">{currentUser.email}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Change Password</h3>
        <Input
          type="password"
          label="Current Password"
          error={errors.currentPassword?.message}
          {...register('currentPassword', { required: 'Required' })}
        />
        <Input
          type="password"
          label="New Password"
          error={errors.newPassword?.message}
          {...register('newPassword', {
            required: 'Required',
            minLength: { value: 8, message: 'At least 8 characters' },
          })}
        />
        <Button type="submit">Update Password</Button>
      </form>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-10 h-6 accent-brand-600"
      />
    </label>
  );
}

function PrivacySettingsTab() {
  const { currentUser, updateCurrentUser } = useAuth();
  const settings = currentUser.privacySettings || { publicByDefault: true, showEmail: false, showBirthday: true };

  const update = (key, value) => {
    const next = { ...settings, [key]: value };
    updateCurrentUser({ privacySettings: next });
    showToast('Privacy settings saved');
  };

  return (
    <div>
      <ToggleRow
        label="Make new posts public by default"
        description="You can still change visibility per post"
        checked={settings.publicByDefault}
        onChange={(e) => update('publicByDefault', e.target.checked)}
      />
      <ToggleRow
        label="Show email on profile"
        checked={settings.showEmail}
        onChange={(e) => update('showEmail', e.target.checked)}
      />
      <ToggleRow
        label="Show birthday on profile"
        checked={settings.showBirthday}
        onChange={(e) => update('showBirthday', e.target.checked)}
      />
    </div>
  );
}

function SecuritySettingsTab() {
  const { currentUser, updateCurrentUser } = useAuth();
  const enabled = !!currentUser.loginAlerts;

  return (
    <div>
      <ToggleRow
        label="Login alerts"
        description="Get notified of logins from new devices (simulated in this demo)"
        checked={enabled}
        onChange={(e) => {
          updateCurrentUser({ loginAlerts: e.target.checked });
          showToast('Security settings saved');
        }}
      />
      <div className="pt-4 text-xs text-gray-400">
        Two-factor authentication and active session management require a real backend and
        aren't available in this localStorage-only demo.
      </div>
    </div>
  );
}

function NotificationSettingsTab() {
  const { currentUser, updateCurrentUser } = useAuth();
  const prefs = currentUser.notificationPrefs || { likes: true, comments: true, friendRequests: true, messages: true };

  const update = (key, value) => {
    updateCurrentUser({ notificationPrefs: { ...prefs, [key]: value } });
    showToast('Notification settings saved');
  };

  return (
    <div>
      <ToggleRow label="Likes" checked={prefs.likes} onChange={(e) => update('likes', e.target.checked)} />
      <ToggleRow label="Comments" checked={prefs.comments} onChange={(e) => update('comments', e.target.checked)} />
      <ToggleRow
        label="Friend requests"
        checked={prefs.friendRequests}
        onChange={(e) => update('friendRequests', e.target.checked)}
      />
      <ToggleRow label="Messages" checked={prefs.messages} onChange={(e) => update('messages', e.target.checked)} />
    </div>
  );
}

function ThemeSettingsTab({ theme, onToggleTheme }) {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => theme !== 'light' && onToggleTheme()}
        className={`flex-1 p-4 rounded-xl border-2 text-center ${theme === 'light' ? 'border-brand-600' : 'border-gray-200 dark:border-gray-700'}`}
      >
        <p className="text-3xl mb-2">☀️</p>
        <p className="text-sm font-medium">Light</p>
      </button>
      <button
        onClick={() => theme !== 'dark' && onToggleTheme()}
        className={`flex-1 p-4 rounded-xl border-2 text-center ${theme === 'dark' ? 'border-brand-600' : 'border-gray-200 dark:border-gray-700'}`}
      >
        <p className="text-3xl mb-2">🌙</p>
        <p className="text-sm font-medium">Dark</p>
      </button>
    </div>
  );
}

function LanguageSettingsTab() {
  const { currentUser, updateCurrentUser } = useAuth();
  const [language, setLanguage] = useState(currentUser.language || 'English');

  const handleChange = (e) => {
    setLanguage(e.target.value);
    updateCurrentUser({ language: e.target.value });
    showToast('Language updated');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Display language
      </label>
      <select
        value={language}
        onChange={handleChange}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option>English</option>
        <option>Urdu</option>
        <option>Arabic</option>
        <option>Spanish</option>
        <option>French</option>
      </select>
    </div>
  );
}

export default function SettingsPage({ theme, onToggleTheme }) {
  const [tab, setTab] = useState('profile');

  return (
    <PageWithSidebar>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Settings</h1>
      <div className="flex flex-col sm:flex-row gap-6">
        <nav className="sm:w-56 flex-shrink-0 flex sm:flex-col gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap text-left transition-colors ${
                tab === t.key
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="card p-5 flex-1 min-w-0">
          {tab === 'profile' && <ProfileSettingsTab />}
          {tab === 'account' && <AccountSettingsTab />}
          {tab === 'privacy' && <PrivacySettingsTab />}
          {tab === 'security' && <SecuritySettingsTab />}
          {tab === 'notifications' && <NotificationSettingsTab />}
          {tab === 'theme' && <ThemeSettingsTab theme={theme} onToggleTheme={onToggleTheme} />}
          {tab === 'language' && <LanguageSettingsTab />}
        </div>
      </div>
    </PageWithSidebar>
  );
}
