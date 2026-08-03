// utils/toastBus.js
// Minimal pub-sub so any component can fire a toast without prop drilling
// or needing a Context provider. Kept separate from Toaster.jsx so that file
// only exports the <Toaster /> component (required for React Fast Refresh).

let listeners = [];
let idCounter = 0;

export function showToast(message, type = 'success') {
  const id = ++idCounter;
  listeners.forEach((listener) => listener({ id, message, type }));
}

export function subscribeToToasts(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
