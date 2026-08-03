import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');
  const infoMessage = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    setFormError('');
    try {
      const loggedInUser = login({ email, password });
      // First-time login after signup: finish the guided profile setup first.
      if (!loggedInUser.onboarded) {
        navigate('/onboarding', { replace: true });
        return;
      }
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-1">
        Welcome back
      </h1>
      <p className="text-center text-gray-500 text-sm mb-6">Log in to your SocialApp account</p>

      {infoMessage && (
        <div className="mb-4 text-sm text-brand-700 bg-brand-50 dark:bg-brand-900/30 dark:text-brand-300 rounded-lg px-3 py-2 text-center">
          {infoMessage}
        </div>
      )}

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
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
        />
        <div className="text-right -mt-2">
          <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        {formError && <p className="text-sm text-rose-600 text-center">{formError}</p>}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Log in
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        Don't have an account?{' '}
        <Link to="/signup" className="text-brand-600 font-medium hover:underline">
          Sign up
        </Link>
      </p>

      <div className="mt-6 text-xs text-gray-400 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-center">
        Demo accounts (password <span className="font-mono">Demo1234</span>): asad@demo.com ·
        ayesha@demo.com · bilal@demo.com · sara@demo.com
      </div>
    </div>
  );
}
