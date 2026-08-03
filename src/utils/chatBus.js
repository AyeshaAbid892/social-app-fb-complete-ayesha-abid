// utils/chatBus.js
// Same pattern as toastBus.js: a minimal pub/sub so every useChat() instance
// in THIS tab re-reads localStorage immediately after a write.
//
// Why this exists: the browser's native `storage` event (used for real-time
// sync ACROSS tabs, per the assignment spec) only fires in OTHER tabs — the
// tab that actually called localStorage.setItem never receives its own event.
// A single tab can have multiple components using useChat() at once
// (e.g. the Navbar's unread badge + an open ChatPage), and all of them need
// to update the moment a message is sent, not just on the next unrelated
// re-render. So: native `storage` event for cross-tab, this bus for same-tab.

let listeners = [];

export function notifyChatChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeToChatChanges(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
