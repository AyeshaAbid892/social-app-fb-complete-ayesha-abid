export default function Lightbox({ src, onClose }) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <img src={src} alt="Full size" className="max-w-full max-h-full rounded-lg" />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center text-lg hover:bg-white/20"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
