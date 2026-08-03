import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { showToast } from '../../utils/toastBus';
import Input from '../ui/Input';
import Button from '../ui/Button';

const FIELD_ROWS = [
  { key: 'work', label: 'Work', icon: '💼' },
  { key: 'education', label: 'Education', icon: '🎓' },
  { key: 'location', label: 'Address', icon: '📍' },
  { key: 'phone', label: 'Phone', icon: '📞' },
  { key: 'email', label: 'Email', icon: '✉️' },
  { key: 'birthday', label: 'Birthday', icon: '🎂' },
  { key: 'relationshipStatus', label: 'Relationship Status', icon: '💍' },
  { key: 'website', label: 'Website', icon: '🔗' },
];

export default function AboutSection({ user, isOwner }) {
  const { updateCurrentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: FIELD_ROWS.reduce(
      (acc, f) => ({ ...acc, [f.key]: user[f.key] || (f.key === 'email' ? user.email : '') }),
      {}
    ),
  });

  const onSubmit = (data) => {
    updateCurrentUser(data);
    showToast('About section updated');
    setEditing(false);
  };

  if (editing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="card p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Edit About</h3>
        {FIELD_ROWS.map((f) => (
          <Input key={f.key} label={f.label} {...register(f.key)} />
        ))}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    );
  }

  const filledRows = FIELD_ROWS.filter((f) => user[f.key]);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">About</h3>
        {isOwner && (
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            Edit Details
          </Button>
        )}
      </div>

      {filledRows.length === 0 && (
        <p className="text-sm text-gray-400">
          {isOwner ? 'Add some details about yourself.' : 'No details added yet.'}
        </p>
      )}

      <div className="space-y-3">
        {filledRows.map((f) => (
          <div key={f.key} className="flex items-center gap-3 text-sm">
            <span className="w-6 text-center">{f.icon}</span>
            <span className="text-gray-700 dark:text-gray-200">{user[f.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
