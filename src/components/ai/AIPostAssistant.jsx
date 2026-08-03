import { useState } from 'react';
import { useAI, AIConfigError } from '../../hooks/useAI';
import Button from '../ui/Button';
import AIIcon from '../ui/AIIcon';

/**
 * Collapsible AI panel for Create Post / Edit Post. Closed by default per
 * spec — the user opts in by clicking to expand it. The suggestion is never
 * auto-submitted: "Use This Content" only fills the textarea, the user still
 * has to review/edit and click Publish themselves.
 */
export default function AIPostAssistant({ onUseContent }) {
  const { generatePostContent } = useAI();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setSuggestion('');
    try {
      const description = await generatePostContent(prompt);
      setSuggestion(description);
    } catch (err) {
      setError(
        err instanceof AIConfigError
          ? 'AI isn\'t set up yet — add your OpenAI key to .env (see README).'
          : "Couldn't generate a suggestion right now — please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-brand-200 dark:border-brand-800 rounded-xl overflow-hidden mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-brand-50 dark:bg-brand-900/20 text-sm font-medium text-brand-700 dark:text-brand-300"
      >
        <span className="flex items-center gap-1.5">
          <AIIcon className="w-4 h-4" />
          AI Writing Assistant
        </span>
        <span className="text-xs">{open ? '▲ Collapse' : '▼ Expand'}</span>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Give me a short idea and I'll draft a post description for you.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            placeholder="e.g. I just completed a React project"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Button type="button" onClick={handleGenerate} disabled={loading || !prompt.trim()} size="sm">
            {loading ? 'Generating…' : 'Generate Post Content'}
          </Button>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          {suggestion && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{suggestion}</p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  onUseContent(suggestion);
                  setSuggestion('');
                  setPrompt('');
                  setOpen(false);
                }}
              >
                Use This Content
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
