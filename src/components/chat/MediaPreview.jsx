export default function MediaPreview({ file, onRemove }) {
  if (!file) return null;

  return (
    <div className="relative inline-block mb-2 ml-1">
      {file.type === 'image' ? (
        <img src={file.dataUrl} alt="Attachment preview" className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
      ) : (
        <video src={file.dataUrl} className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
      )}
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center shadow hover:bg-rose-600"
        aria-label="Remove attachment"
      >
        ✕
      </button>
    </div>
  );
}
