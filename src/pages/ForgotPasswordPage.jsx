import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { storage } from '../utils/storage';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email }) => {
    // No real backend/email service exists in this frontend-only app.
    // We just check whether the email is registered and simulate the flow.
    const exists = storage.getUsers().some((u) => u.email.toLowerCase() === email.toLowerCase());
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    return exists; // intentionally don't reveal existence in the UI, to mirror real apps
  };

  return (
    <div className="max-w-sm mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-1">
        Reset your password
      </h1>
      <p className="text-center text-gray-500 text-sm mb-6">
        Enter your email and we'll send you a reset link
      </p>

      {sent ? (
        <div className="text-center">
          <p className="text-4xl mb-3">📬</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            If an account exists for that email, a reset link is on its way. This is a demo app
            with no real email service, so no email will actually arrive.
          </p>
          <Link to="/login" className="text-brand-600 font-medium hover:underline text-sm">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Send reset link
          </Button>
          <p className="text-center text-sm text-gray-500">
            Remembered your password?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
