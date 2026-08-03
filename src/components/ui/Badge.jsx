import clsx from 'clsx';

const VARIANTS = {
  draft: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  public: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  private: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
};

const LABELS = {
  draft: 'Draft',
  public: 'Public',
  private: 'Private',
};

export default function Badge({ variant = 'draft', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        VARIANTS[variant],
        className
      )}
    >
      {LABELS[variant]}
    </span>
  );
}
