import { useState } from 'react';
import { useAI, AIConfigError } from '../../hooks/useAI';
import Button from '../ui/Button';
import AIIcon from '../ui/AIIcon';

/**
 * "Optimise with AI" button near the bio field in Profile Settings.
 * Reads the CURRENT form values (name/bio/location) at click time via
 * getValues, so it always optimises what's actually in the form right now —
 * including edits the user hasn't saved yet.
 */
export default function AIProfileOptimize({ getValues, onSuggestion }) {
  const { optimizeBio } = useAI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    setSuggestion('');
    try {
      const { name, bio, location } = getValues();
      const improved = await optimizeBio({ bio, name, location });
      setSuggestion(improved);
    } catch (err) {
      setError(
        err instanceof AIConfigError
          ? "AI isn't set up yet — add your OpenAI key to .env."
          : "Couldn't optimise your bio right now — please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <Button type="button" size="sm" variant="secondary" onClick={handleClick} disabled={loading}>
        <span className="flex items-center gap-1.5">
          <AIIcon className="w-3.5 h-3.5" animated={loading} />
          {loading ? 'Optimising…' : 'Optimise with AI'}
        </span>
      </Button>

      {error && <p className="text-xs text-rose-600 mt-1.5">{error}</p>}

      {suggestion && (
        <div className="mt-2 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-3">
          <p className="text-xs font-medium text-brand-700 dark:text-brand-300 mb-1">Suggested bio:</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{suggestion}</p>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onSuggestion(suggestion);
              setSuggestion('');
            }}
          >
            Use Suggestion
          </Button>
        </div>
      )}
    </div>
  );
}
