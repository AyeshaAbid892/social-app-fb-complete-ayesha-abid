import { useState, useCallback, useEffect } from 'react';
import { storage } from '../utils/storage';
import { notifyChatChange, subscribeToChatChanges } from '../utils/chatBus';

/**
 * Kept separate from useChat.js on purpose: these are per-viewer conversation
 * PREFERENCES (mute/archive/hide/nickname) and a global BLOCK relationship —
 * neither touches the message timeline itself, so mixing them into the
 * already-large useChat.js would blur what that hook is responsible for.
 * Same version+bump+chatBus sync pattern as useChat, for the same reasons.
 */
export function useChatSettings() {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const onStorage = (event) => {
      if (['chatSettings', 'blockedUsers'].includes(event.key)) bump();
    };
    window.addEventListener('storage', onStorage);
    const unsubscribe = subscribeToChatChanges(bump);
    return () => {
      window.removeEventListener('storage', onStorage);
      unsubscribe();
    };
  }, [bump]);

  const getSettings = useCallback((conversationId) => {
    return storage.getChatSettings()[conversationId] || { mutedBy: [], archivedBy: [], hiddenBy: [], nicknames: {} };
  }, [version]);

  const updateSettings = useCallback((conversationId, updater) => {
    const all = storage.getChatSettings();
    const current = all[conversationId] || { mutedBy: [], archivedBy: [], hiddenBy: [], nicknames: {} };
    storage.setChatSettings({ ...all, [conversationId]: updater(current) });
    bump();
    notifyChatChange();
  }, [bump]);

  const toggleArrayMember = (arr, userId) => (arr.includes(userId) ? arr.filter((id) => id !== userId) : [...arr, userId]);

  const toggleMute = useCallback((conversationId, userId) => {
    updateSettings(conversationId, (s) => ({ ...s, mutedBy: toggleArrayMember(s.mutedBy || [], userId) }));
  }, [updateSettings]);

  const toggleArchive = useCallback((conversationId, userId) => {
    updateSettings(conversationId, (s) => ({ ...s, archivedBy: toggleArrayMember(s.archivedBy || [], userId) }));
  }, [updateSettings]);

  /** "Delete chat" only hides it from YOUR sidebar — same reasoning as
   * delete-for-me on individual messages. It reappears if a new message arrives. */
  const hideConversation = useCallback((conversationId, userId) => {
    updateSettings(conversationId, (s) => ({ ...s, hiddenBy: [...new Set([...(s.hiddenBy || []), userId])] }));
  }, [updateSettings]);

  const unhideConversation = useCallback((conversationId, userId) => {
    updateSettings(conversationId, (s) => ({ ...s, hiddenBy: (s.hiddenBy || []).filter((id) => id !== userId) }));
  }, [updateSettings]);

  const setNickname = useCallback((conversationId, viewerId, friendId, nickname) => {
    updateSettings(conversationId, (s) => ({
      ...s,
      nicknames: { ...s.nicknames, [`${viewerId}:${friendId}`]: nickname },
    }));
  }, [updateSettings]);

  const getNickname = useCallback((conversationId, viewerId, friendId) => {
    return getSettings(conversationId).nicknames?.[`${viewerId}:${friendId}`] || null;
  }, [getSettings]);

  const isMuted = useCallback((conversationId, userId) => getSettings(conversationId).mutedBy?.includes(userId), [getSettings]);
  const isArchived = useCallback((conversationId, userId) => getSettings(conversationId).archivedBy?.includes(userId), [getSettings]);
  const isHidden = useCallback((conversationId, userId) => getSettings(conversationId).hiddenBy?.includes(userId), [getSettings]);

  /** When a user disables read receipts for a conversation, their opens no
   * longer mark the other person's messages as read (no double-tick) — but
   * they also won't see double-ticks on their OWN sent messages, matching
   * how Messenger's mutual read-receipts toggle actually behaves. */
  const toggleReadReceipts = useCallback((conversationId, userId) => {
    updateSettings(conversationId, (s) => ({
      ...s,
      readReceiptsDisabledBy: toggleArrayMember(s.readReceiptsDisabledBy || [], userId),
    }));
  }, [updateSettings]);

  const readReceiptsEnabled = useCallback((conversationId, userId) => {
    return !getSettings(conversationId).readReceiptsDisabledBy?.includes(userId);
  }, [getSettings]);

  // ---- Blocking: a global relationship, not per-conversation ----
  const getBlockedIds = useCallback((userId) => storage.getBlockedUsers()[userId] || [], [version]);

  const toggleBlock = useCallback((userId, targetId) => {
    const all = storage.getBlockedUsers();
    const current = all[userId] || [];
    const next = toggleArrayMember(current, targetId);
    storage.setBlockedUsers({ ...all, [userId]: next });
    bump();
    notifyChatChange();
  }, [bump]);

  const isBlocked = useCallback((userId, targetId) => getBlockedIds(userId).includes(targetId), [getBlockedIds]);

  return {
    getSettings,
    toggleMute,
    toggleArchive,
    hideConversation,
    unhideConversation,
    setNickname,
    getNickname,
    isMuted,
    isArchived,
    isHidden,
    toggleReadReceipts,
    readReceiptsEnabled,
    getBlockedIds,
    toggleBlock,
    isBlocked,
  };
}
