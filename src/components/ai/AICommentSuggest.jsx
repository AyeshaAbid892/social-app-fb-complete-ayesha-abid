import { useState } from 'react';
import { useAI, AIConfigError } from '../../hooks/useAI';
import AIIcon from '../ui/AIIcon';

/**
 * Small "Suggest Comment" control next to the comment input. Only ever
 * rendered for logged-in users (the parent decides that — see
 * CommentSection.jsx). Fills the input; never auto-posts.
 */
export default function AICommentSuggest({ postDescription, commenterName, postOwnerName, isOwnPost, onSuggestion }) {
  const { generateComment } = useAI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [justSuggested, setJustSuggested] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      const comment = await generateComment({ postDescription, commenterName, postOwnerName, isOwnPost });
      onSuggestion(comment);
      setJustSuggested(true);
      setTimeout(() => setJustSuggested(false), 1400);
    } catch (err) {
      setError(
        err instanceof AIConfigError
          ? "AI isn't set up yet — add your OpenAI key to .env."
          : "Couldn't suggest a comment — try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="group relative inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-3 py-1.5 text-xs font-semibold
          bg-gradient-to-r from-brand-50 to-violet-50 text-brand-700 border border-brand-200/80
          hover:from-brand-100 hover:to-violet-100 hover:border-brand-300 hover:shadow-sm
          active:scale-[0.97] transition-all duration-150
          disabled:opacity-70 disabled:cursor-wait disabled:active:scale-100
          dark:from-brand-900/30 dark:to-violet-900/20 dark:text-brand-300 dark:border-brand-800/80
          dark:hover:from-brand-900/50 dark:hover:to-violet-900/40"
      >
        <AIIcon className="w-3.5 h-3.5" animated={loading} />
        <span>{loading ? 'Thinking…' : justSuggested ? 'Added ✓' : 'Suggest comment'}</span>
      </button>
      {error && <span className="text-xs text-rose-600 dark:text-rose-400">{error}</span>}
    </div>
  );
}
