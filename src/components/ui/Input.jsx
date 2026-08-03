import { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Reusable text input. Spread {...register('field')} from React Hook Form
 * straight onto this component — it forwards the ref correctly.
 */
const Input = forwardRef(function Input(
  { label, error, className, textarea = false, ...rest },
  ref
) {
  const Component = textarea ? 'textarea' : 'input';

  return (
    <div className="w-full text-left">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <Component
        ref={ref}
        className={clsx(
          'w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-900',
          'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500',
          'transition-colors duration-150',
          error
            ? 'border-rose-400 focus:ring-rose-400'
            : 'border-gray-300 dark:border-gray-700',
          textarea && 'resize-none min-h-[100px]',
          className
        )}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
});

export default Input;
