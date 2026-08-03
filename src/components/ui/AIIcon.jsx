import { useId } from 'react';
import clsx from 'clsx';

/**
 * Single shared "AI" mark used everywhere the app surfaces an AI feature
 * (comment suggestions, chat suggestions/auto-reply, post assistant, bio
 * optimizer, AI settings toggle). Swapping every ad-hoc ✨/star for one real
 * icon is what makes AI features feel like one coherent product instead of
 * several bolted-on demos — see any instance and you instantly know "this is
 * the AI thing".
 *
 * Renders a minimal, premium chatbot/robot mark — a rounded head with a
 * single antenna and two "eyes" — on a brand→violet gradient, so it reads
 * distinctly from the plain brand blue used for regular UI while staying
 * simple enough to work at 12–16px. `animated` adds a slow pulse for loading
 * states (matches the previous icon's behavior).
 */
export default function AIIcon({ className = 'w-4 h-4', animated = false }) {
  const gradId = useId();

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={clsx(className, animated && 'animate-pulse')}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="55%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>

      {/* Antenna */}
      <path d="M12 2.5v2.25" stroke={`url(#${gradId})`} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="2.15" r="1.15" fill={`url(#${gradId})`} />

      {/* Head */}
      <rect x="4" y="5.75" width="16" height="13" rx="4.25" fill={`url(#${gradId})`} />

      {/* Side "ears"/sensors */}
      <rect x="1.6" y="10.5" width="2" height="4" rx="1" fill={`url(#${gradId})`} opacity="0.85" />
      <rect x="20.4" y="10.5" width="2" height="4" rx="1" fill={`url(#${gradId})`} opacity="0.85" />

      {/* Face plate */}
      <rect x="6.75" y="8.5" width="10.5" height="7.5" rx="2.75" fill="white" fillOpacity="0.94" />

      {/* Eyes */}
      <circle cx="9.75" cy="12.25" r="1.15" fill={`url(#${gradId})`} />
      <circle cx="14.25" cy="12.25" r="1.15" fill={`url(#${gradId})`} />

      {/* Smile */}
      <path d="M9.9 14.15c.6.55 1.35.85 2.1.85s1.5-.3 2.1-.85" stroke={`url(#${gradId})`} strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  );
}
