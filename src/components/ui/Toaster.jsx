import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { subscribeToToasts } from '../../utils/toastBus';

const STYLES = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-gray-800',
};

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNewToast = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    };
    return subscribeToToasts(handleNewToast);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg animate-slide-up',
            STYLES[toast.type] || STYLES.success
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
