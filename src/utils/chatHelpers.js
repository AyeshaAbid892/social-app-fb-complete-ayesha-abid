// utils/chatHelpers.js
// Pure, stateless helpers for the chat feature. No localStorage reads/writes
// live here (that's storage.js) and no React state lives here (that's
// useChat.js) — just deterministic functions that are easy to unit-test
// and easy to explain in isolation.

/**
 * Build a conversation id for a pair of users that is IDENTICAL regardless of
 * who opens the chat first. Sorting both ids alphabetically before joining
 * guarantees getConversationId('usr_a','usr_b') === getConversationId('usr_b','usr_a').
 * Skipping this sort is the #1 "common mistake" called out in the spec —
 * without it, A→B and B→A would silently become two different conversations
 * and messages would appear to "disappear" depending on who opened the chat.
 */
export function getConversationId(userIdA, userIdB) {
  return [userIdA, userIdB].sort().join('_');
}

/** Truncate a message preview for the conversation list row (40 chars max per spec). */
export function formatMessagePreview(message) {
  if (!message) return '';
  if (message.type === 'image') return '📷 Photo';
  if (message.type === 'video') return '🎬 Video';
  const text = message.content || '';
  return text.length <= 40 ? text : `${text.slice(0, 40).trim()}…`;
}

/**
 * Group consecutive messages from the same sender so we only show one
 * avatar + one timestamp per "burst" of messages, like a real messenger.
 * Returns the original messages with two extra flags per item:
 *   showAvatar   -> true if this is the LAST message in a same-sender run
 *   showTimestamp -> true if this is the LAST message in a same-sender run
 */
export function groupMessagesBySender(messages) {
  return messages.map((msg, index) => {
    const next = messages[index + 1];
    const isLastInGroup = !next || next.senderId !== msg.senderId;
    return { ...msg, showAvatar: isLastInGroup, showTimestamp: isLastInGroup };
  });
}

/** A user counts as "online" if their last-seen heartbeat was within this window. */
export const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes, per spec

export function isUserOnline(lastSeenIso) {
  if (!lastSeenIso) return false;
  return Date.now() - new Date(lastSeenIso).getTime() < ONLINE_THRESHOLD_MS;
}

/** A "typing" write counts as fresh/active for this long before it's considered stale. */
export const TYPING_EXPIRY_MS = 3000;

export function isTypingFresh(typingTimestampMs) {
  if (!typingTimestampMs) return false;
  return Date.now() - typingTimestampMs < TYPING_EXPIRY_MS;
}
