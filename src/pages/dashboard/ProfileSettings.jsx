import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fileToBase64 } from '../../utils/helpers';
import { showToast } from '../../utils/toastBus';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import AIProfileOptimize from '../../components/ai/AIProfileOptimize';

const MAX_BIO = 150;

export default function ProfileSettings() {
  const { currentUser, updateCurrentUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: currentUser.name,
      bio: currentUser.bio || '',
      location: currentUser.location || '',
    },
  });

  const bio = watch('bio') || '';

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setAvatarPreview(base64);
  };

  const onSubmit = (data) => {
    setSaving(true);
    updateCurrentUser({
      name: data.name,
      bio: data.bio,
      location: data.location,
      avatar: avatarPreview,
    });
    showToast('Profile updated successfully');
    setSaving(false);
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Profile Settings</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Avatar
          </label>
          <div className="flex items-center gap-4">
            <Avatar src={avatarPreview} name={currentUser.name} size="lg" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-900/30 dark:file:text-brand-300 file:cursor-pointer cursor-pointer"
            />
          </div>
        </div>

        <Input
          label="Full Name"
          error={errors.name?.message}
          {...register('name', { required: 'Full name is required' })}
        />

        <div>
          <Input
            textarea
            label="Bio"
            placeholder="Tell people about yourself..."
            maxLength={MAX_BIO}
            {...register('bio', {
              maxLength: { value: MAX_BIO, message: `Maximum ${MAX_BIO} characters` },
            })}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {bio.length} / {MAX_BIO} characters
          </p>
          <AIProfileOptimize
            getValues={getValues}
            onSuggestion={(text) => setValue('bio', text.slice(0, MAX_BIO), { shouldDirty: true })}
          />
        </div>

        <Input label="Location" placeholder="City, Country" {...register('location')} />

        <Button type="submit" isLoading={saving}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}
