import { useRef, useState, useEffect } from 'react';
import Button from '../ui/Button';
import MediaPreview from './MediaPreview';
import { fileToBase64 } from '../../utils/helpers';

const EMOJIS = ['😀', '😂', '😍', '👍', '🙏', '🎉', '😢', '😮', '🔥', '❤️', '😅', '🤔'];
const TYPING_DEBOUNCE_MS = 400;

export default function MessageInput({ value, onChange, onSend, onTyping, blockedMessage }) {
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [file, setFile] = useState(null); // { type: 'image'|'video', dataUrl }
  const [emojiOpen, setEmojiOpen] = useState(false);

  // Auto-grow up to 4 lines, then scroll internally — per spec.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 20;
    const maxHeight = lineHeight * 4 + 16; // 4 lines + padding
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value]);

  const handleChange = (e) => {
    onChange(e.target.value);
    // Debounce the typing-status write so we don't hit localStorage on
    // every single keystroke — only after a short pause in typing activity.
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(), TYPING_DEBOUNCE_MS);
  };

  useEffect(() => () => clearTimeout(typingTimeoutRef.current), []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const dataUrl = await fileToBase64(selected);
    const type = selected.type.startsWith('video') ? 'video' : 'image';
    setFile({ type, dataUrl });
    e.target.value = '';
  };

  const handleSend = () => {
    const text = value.trim();
    if (!text && !file) return;
    onSend({ text, file });
    setFile(null);
  };

  const insertEmoji = (emoji) => {
    onChange(value + emoji);
    setEmojiOpen(false);
    textareaRef.current?.focus();
  };

  const disabled = !value.trim() && !file;

  if (blockedMessage) {
    return (
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 text-center text-sm text-gray-400">
        {blockedMessage}
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-3">
      <MediaPreview file={file} onRemove={() => setFile(null)} />

      <div className="flex items-end gap-2">
        <label className="cursor-pointer w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Attach photo or video">
          📎
          <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
        </label>

        <div className="relative flex-shrink-0">
          <button
            onClick={() => setEmojiOpen((o) => !o)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Emoji"
          >
            😊
          </button>
          {emojiOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setEmojiOpen(false)} />
              <div className="absolute z-20 bottom-11 left-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-2 grid grid-cols-6 gap-1 w-56">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="text-xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message…"
          className="flex-1 resize-none rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 max-h-[96px] overflow-y-auto"
        />

        <Button onClick={handleSend} disabled={disabled} className="rounded-full !px-4 flex-shrink-0">
          Send
        </Button>
      </div>
    </div>
  );
}
