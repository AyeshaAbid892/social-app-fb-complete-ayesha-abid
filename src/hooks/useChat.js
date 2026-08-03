import { useState, useCallback, useEffect } from 'react';
import { storage, generateId } from '../utils/storage';
import { notifyChatChange, subscribeToChatChanges } from '../utils/chatBus';
import { getConversationId, isUserOnline, isTypingFresh } from '../utils/chatHelpers';

/**
 * Central hook for the chat feature: messages, conversation list, unread
 * counts, read receipts, reactions, search, presence and typing status.
 *
 * Follows the same "version + bump" convention as useFriends/useNotifications/
 * usePosts elsewhere in this app, PLUS a second sync channel (see chatBus.js):
 *   - native `storage` event  -> re-render when ANOTHER tab writes  (cross-tab)
 *   - chatBus subscription    -> re-render when THIS tab writes     (same-tab)
 * Both funnel into the same bump(), so every consumer of useChat() just reads
 * `version` implicitly through the getters below and never has to think about
 * which channel fired.
 */
export function useChat() {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const onStorage = (event) => {
      // Only re-render for keys this hook actually cares about — an
      // unrelated write (e.g. theme) shouldn't cause every chat window
      // in every tab to re-render.
      if (['messages', 'presence', 'typingStatus'].includes(event.key)) {
        bump();
      }
    };
    window.addEventListener('storage', onStorage);
    // Same-tab: chatBus fires on every local write (see each function below).
    const unsubscribe = subscribeToChatChanges(bump);
    return () => {
      window.removeEventListener('storage', onStorage);
      unsubscribe();
    };
  }, [bump]);

  // Every local write goes through this so both the storage AND the
  // same-tab bus stay in sync in one place.
  const persistMessages = useCallback((messages) => {
    storage.setMessages(messages);
    bump();
    notifyChatChange();
  }, [bump]);

  // ---------------------------------------------------------------------
  // Messages
  // ---------------------------------------------------------------------

  const getMessages = useCallback((conversationId, currentUserId) => {
    return storage
      .getMessages()
      .filter((m) => m.conversationId === conversationId)
      .filter((m) => !currentUserId || !m.deletedFor?.includes(currentUserId))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [version]);

  const sendMessage = useCallback(({ senderId, receiverId, type = 'text', content, aiGenerated = false, replyToId = null }) => {
    const conversationId = getConversationId(senderId, receiverId);
    const message = {
      id: generateId('msg'),
      conversationId,
      senderId,
      receiverId,
      type, // 'text' | 'image' | 'video' | 'system'
      content,
      timestamp: new Date().toISOString(),
      read: false,
      aiGenerated,
      replyToId, // id of the message being replied to, or null
      pinned: false,
      deletedFor: [], // userIds who chose "delete for me"
      reactions: {}, // { '❤️': ['usr_abc', ...] }
    };
    persistMessages([...storage.getMessages(), message]);
    return message;
  }, [persistMessages]);

  /**
   * System messages (e.g. "Alex changed the theme to Ocean") are stored as
   * regular messages with type: 'system' so they slot naturally into the
   * existing timeline/sort/real-time-sync machinery — no parallel code path
   * needed just to render an announcement inline.
   */
  const sendSystemMessage = useCallback((conversationId, senderId, receiverId, content) => {
    const message = {
      id: generateId('msg'),
      conversationId,
      senderId,
      receiverId,
      type: 'system',
      content,
      timestamp: new Date().toISOString(),
      read: true, // system messages don't affect unread counts
      aiGenerated: false,
      replyToId: null,
      pinned: false,
      deletedFor: [],
      reactions: {},
    };
    persistMessages([...storage.getMessages(), message]);
    return message;
  }, [persistMessages]);

  const markConversationRead = useCallback((conversationId, currentUserId) => {
    const messages = storage.getMessages();
    let changed = false;
    const next = messages.map((m) => {
      if (m.conversationId === conversationId && m.receiverId === currentUserId && !m.read) {
        changed = true;
        return { ...m, read: true };
      }
      return m;
    });
    if (changed) persistMessages(next);
  }, [persistMessages]);

  const toggleReaction = useCallback((messageId, userId, emoji) => {
    const messages = storage.getMessages();
    const next = messages.map((m) => {
      if (m.id !== messageId) return m;
      const current = m.reactions?.[emoji] || [];
      const already = current.includes(userId);
      const updatedUsers = already ? current.filter((id) => id !== userId) : [...current, userId];
      const nextReactions = { ...m.reactions, [emoji]: updatedUsers };
      if (updatedUsers.length === 0) delete nextReactions[emoji];
      return { ...m, reactions: nextReactions };
    });
    persistMessages(next);
  }, [persistMessages]);

  /** Bonus: message search within one conversation — plain .filter(), no library. */
  const searchMessages = useCallback((conversationId, query) => {
    if (!query?.trim()) return [];
    const q = query.trim().toLowerCase();
    return getMessages(conversationId).filter(
      (m) => m.type === 'text' && m.content.toLowerCase().includes(q)
    );
  }, [getMessages]);

  const getMessageById = useCallback((messageId) => {
    return storage.getMessages().find((m) => m.id === messageId) || null;
  }, [version]);

  /**
   * "Delete for me" only hides the message for the user who deleted it — it
   * stays in storage (and visible to the other participant), matching how
   * Messenger/WhatsApp actually behave. "Delete for everyone" replaces the
   * content instead, since real deletion would break the other participant's
   * reply-chain references to it.
   */
  const deleteMessageForMe = useCallback((messageId, userId) => {
    const messages = storage.getMessages();
    const next = messages.map((m) =>
      m.id === messageId ? { ...m, deletedFor: [...new Set([...(m.deletedFor || []), userId])] } : m
    );
    persistMessages(next);
  }, [persistMessages]);

  const deleteMessageForEveryone = useCallback((messageId) => {
    const messages = storage.getMessages();
    const next = messages.map((m) =>
      m.id === messageId ? { ...m, type: 'text', content: '', deletedForEveryone: true, reactions: {} } : m
    );
    persistMessages(next);
  }, [persistMessages]);

  const togglePinMessage = useCallback((messageId) => {
    const messages = storage.getMessages();
    const next = messages.map((m) => (m.id === messageId ? { ...m, pinned: !m.pinned } : m));
    persistMessages(next);
  }, [persistMessages]);

  // ---------------------------------------------------------------------
  // Conversation list
  // ---------------------------------------------------------------------

  const getUnreadCount = useCallback((conversationId, currentUserId) => {
    return storage
      .getMessages()
      .filter((m) => m.conversationId === conversationId && m.receiverId === currentUserId && !m.read).length;
  }, [version]);

  const getTotalUnreadCount = useCallback((currentUserId) => {
    return storage.getMessages().filter((m) => m.receiverId === currentUserId && !m.read).length;
  }, [version]);

  /**
   * Conversations are derived from (friends x messages) rather than stored as
   * their own entity — a friend IS a potential conversation, so there's no
   * separate "conversations" key to keep in sync with the friends list.
   * `friends` is passed in (from useFriends) rather than looked up here, so
   * this hook stays decoupled from the friend system's internals.
   */
  const getConversations = useCallback((currentUserId, friends) => {
    const withData = friends.map((friend) => {
      const conversationId = getConversationId(currentUserId, friend.id);
      const messages = getMessages(conversationId, currentUserId);
      const lastMessage = messages[messages.length - 1] || null;
      return {
        friend,
        conversationId,
        lastMessage,
        unreadCount: getUnreadCount(conversationId, currentUserId),
      };
    });

    const withMessages = withData.filter((c) => c.lastMessage);
    const withoutMessages = withData.filter((c) => !c.lastMessage);

    withMessages.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
    withoutMessages.sort((a, b) => a.friend.name.localeCompare(b.friend.name));

    return [...withMessages, ...withoutMessages];
  }, [getMessages, getUnreadCount]);

  // ---------------------------------------------------------------------
  // Presence (online / last seen)
  // ---------------------------------------------------------------------

  const touchPresence = useCallback((userId) => {
    const presence = storage.getPresence();
    storage.setPresence({ ...presence, [userId]: { lastSeen: new Date().toISOString() } });
    // Presence writes are frequent (heartbeat) and don't need every open chat
    // window to instantly re-render — the 1s tick in ChatHeader covers it —
    // so we skip bump()/notifyChatChange() here to avoid needless re-renders.
  }, []);

  const getLastSeen = useCallback((userId) => {
    return storage.getPresence()[userId]?.lastSeen || null;
  }, [version]);

  const isOnline = useCallback((userId) => {
    return isUserOnline(storage.getPresence()[userId]?.lastSeen);
  }, [version]);

  // ---------------------------------------------------------------------
  // Typing status
  // ---------------------------------------------------------------------

  /** Called on every keystroke (debounced by the caller) while composing. */
  const setTyping = useCallback((conversationId, userId) => {
    const typingStatus = storage.getTypingStatus();
    storage.setTypingStatus({
      ...typingStatus,
      [conversationId]: { ...typingStatus[conversationId], [userId]: Date.now() },
    });
    // Same reasoning as touchPresence: high-frequency, self-expiring via
    // timestamp comparison in isOtherTyping — no bump needed on write.
  }, []);

  const isOtherTyping = useCallback((conversationId, otherUserId) => {
    const timestamp = storage.getTypingStatus()[conversationId]?.[otherUserId];
    return isTypingFresh(timestamp);
  }, [version]);

  // ---------------------------------------------------------------------
  // Chat themes (per conversation, visible to both participants)
  // ---------------------------------------------------------------------

  const getConversationTheme = useCallback((conversationId) => {
    return storage.getChatThemes()[conversationId]?.themeId || 'default';
  }, [version]);

  const setConversationTheme = useCallback((conversationId, themeId, changedByUserId, changedByName, otherUserId) => {
    const themes = storage.getChatThemes();
    storage.setChatThemes({ ...themes, [conversationId]: { themeId, updatedAt: new Date().toISOString() } });
    bump();
    notifyChatChange();
    // Announced as a system message so BOTH participants see when/who
    // changed it, right in the timeline — not just a silent UI change.
    sendSystemMessage(conversationId, changedByUserId, otherUserId, `${changedByName} changed the chat theme to ${themeId === 'default' ? 'Classic Blue' : themeId}`);
  }, [bump, sendSystemMessage]);

  return {
    version,
    getMessages,
    sendMessage,
    sendSystemMessage,
    markConversationRead,
    toggleReaction,
    searchMessages,
    getMessageById,
    deleteMessageForMe,
    deleteMessageForEveryone,
    togglePinMessage,
    getUnreadCount,
    getTotalUnreadCount,
    getConversations,
    touchPresence,
    getLastSeen,
    isOnline,
    setTyping,
    isOtherTyping,
    getConversationTheme,
    setConversationTheme,
  };
}
