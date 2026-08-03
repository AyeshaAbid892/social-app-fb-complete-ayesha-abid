export default function ReplyPreview({ message, onCancel }) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 px-4 pt-2 -mb-1">
      <div className="flex-1 min-w-0 border-l-2 border-brand-500 bg-gray-50 dark:bg-gray-800 rounded-r-lg px-3 py-1.5">
        <p className="text-xs font-medium text-brand-600 dark:text-brand-400">Replying to</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {message.type === 'text' ? message.content : `[${message.type}]`}
        </p>
      </div>
      <button
        onClick={onCancel}
        className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Cancel reply"
      >
        ✕
      </button>
    </div>
  );
}
