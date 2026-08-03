import AIIcon from '../ui/AIIcon';

export default function AIChatBanner({ onDisable }) {
  return (
    <button
      onClick={onDisable}
      className="w-full flex items-center gap-2 text-left bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-900/25 dark:to-violet-900/15 border-b border-brand-200/70 dark:border-brand-800/70 px-4 py-2 text-xs font-medium text-brand-700 dark:text-brand-300 hover:from-brand-100 hover:to-violet-100 dark:hover:from-brand-900/40 dark:hover:to-violet-900/25 transition-colors"
    >
      <AIIcon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>AI is responding on your behalf — tap to disable</span>
    </button>
  );
}
