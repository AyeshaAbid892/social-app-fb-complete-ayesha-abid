import { useEffect } from 'react';
import { useChat } from './useChat';

/**
 * Writes a "last seen now" heartbeat for the logged-in user every 30s, plus
 * once immediately on mount/login. Mounted once at the App root (not inside
 * ChatPage) so a friend shows as online while you're anywhere in the app —
 * browsing the feed counts as "online" just as much as being in a chat.
 */
export function usePresenceHeartbeat(currentUserId) {
  const { touchPresence } = useChat();

  useEffect(() => {
    if (!currentUserId) return;
    touchPresence(currentUserId);
    const interval = setInterval(() => touchPresence(currentUserId), 30000);
    return () => clearInterval(interval);
  }, [currentUserId, touchPresence]);
}
