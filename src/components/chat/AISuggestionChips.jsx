import AIIcon from '../ui/AIIcon';

export default function AISuggestionChips({ suggestions, onPick, loading = false, inset = true }) {
  if (!loading && (!suggestions || suggestions.length === 0)) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${inset ? 'pl-10' : 'px-4'} -mt-1 mb-1`}>
      <AIIcon className="w-3.5 h-3.5 flex-shrink-0" animated={loading} />
      {loading && <span className="text-xs text-gray-400 italic">Thinking of replies…</span>}
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onPick(suggestion)}
          className="bg-white border border-brand-200 text-brand-700 text-sm rounded-full px-3 py-1 hover:bg-brand-50 hover:border-brand-300 hover:shadow-sm cursor-pointer transition-all dark:bg-gray-900 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-900/20"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
