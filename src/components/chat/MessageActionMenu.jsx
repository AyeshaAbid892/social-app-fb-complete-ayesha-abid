import { useEffect, useRef } from 'react';

/**
 * Small contextual menu opened from a message bubble's "⋯" button.
 * Options are conditional: only the sender can delete-for-everyone, and
 * there's nothing to copy on an image/video message.
 */
export default function MessageActionMenu({ message, isOwn, onClose, onReply, onCopy, onPin, onDeleteForMe, onDeleteForEveryone }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const item = (label, handler, danger = false) => (
    <button
      onClick={() => { handler(); onClose(); }}
      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${danger ? 'text-rose-600' : 'text-gray-700 dark:text-gray-200'}`}
    >
      {label}
    </button>
  );

  return (
    <div
      ref={ref}
      className="absolute z-30 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-1.5 top-full mt-1"
    >
      {item('↩ Reply', onReply)}
      {message.type === 'text' && item('📋 Copy', onCopy)}
      {item(message.pinned ? '📌 Unpin' : '📌 Pin message', onPin)}
      <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
      {item('🗑 Delete for me', onDeleteForMe, true)}
      {isOwn && item('🗑 Delete for everyone', onDeleteForEveryone, true)}
    </div>
  );
}
