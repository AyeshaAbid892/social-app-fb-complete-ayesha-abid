import clsx from 'clsx';
import { getInitial, getAvatarColor } from '../../utils/helpers';

const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-20 h-20 text-2xl',
};

export default function Avatar({ src, name = '', size = 'md', className }) {
  const sizeClass = SIZES[size] || SIZES.md;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx(sizeClass, 'rounded-full object-cover flex-shrink-0', className)}
      />
    );
  }

  return (
    <div
      className={clsx(
        sizeClass,
        getAvatarColor(name),
        'rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 select-none',
        className
      )}
      aria-label={name}
    >
      {getInitial(name)}
    </div>
  );
}
