import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fileToBase64 } from '../utils/helpers';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';

export default function OnboardingPage() {
  const { currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const { register, handleSubmit } = useForm({
    defaultValues: { bio: '', location: '', profession: '' },
  });

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(await fileToBase64(file));
  };

  const onSubmit = (data) => {
    updateCurrentUser({ ...data, avatar: avatarPreview, onboarded: true });
    navigate('/');
  };

  const handleSkip = () => {
    updateCurrentUser({ onboarded: true });
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-1">
        Welcome, {currentUser.name.split(' ')[0]}! 👋
      </h1>
      <p className="text-center text-gray-500 text-sm mb-6">
        Let's set up your profile so friends can find you
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-5 space-y-4">
        <div className="flex flex-col items-center gap-3">
          <Avatar src={avatarPreview} name={currentUser.name} size="lg" />
          <label className="text-sm text-brand-600 font-medium cursor-pointer">
            Upload profile photo
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        <Input textarea label="Bio" placeholder="Tell people about yourself..." {...register('bio')} />
        <Input label="Profession" placeholder="e.g. Software Engineer" {...register('profession')} />
        <Input label="Location" placeholder="City, Country" {...register('location')} />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleSkip} className="flex-1">
            Skip for now
          </Button>
          <Button type="submit" className="flex-1">
            Finish Setup
          </Button>
        </div>
      </form>
    </div>
  );
}
