// utils/storage.js
// Single source of truth for ALL localStorage reads/writes.
// No component should ever call localStorage directly — always go through this file.

const KEYS = {
  USERS: 'users',
  POSTS: 'posts',
  COMMENTS: 'comments',
  LIKES: 'likes',
  CURRENT_USER: 'currentUser',
  BOOKMARKS: 'bookmarks', // bonus: saved post ids per user, lives on the user object too
  THEME: 'theme',
  FRIEND_REQUESTS: 'friendRequests',
  FRIENDS: 'friends',
  NOTIFICATIONS: 'notifications',
  STORIES: 'stories',
  MESSAGES: 'messages',
  // Not one of the 3 keys named in the spec, but the chat header requires an
  // online/last-seen indicator, and there's no backend to track that — so it's
  // persisted the same way everything else is, one small key per concern.
  PRESENCE: 'presence',
  // Deliberately separate from MESSAGES: typing status is high-frequency,
  // ephemeral (self-expiring after a few seconds — see useChat.js), and has
  // nothing to do with message history, so it shouldn't bloat message writes.
  TYPING_STATUS: 'typingStatus',
  AI_SETTINGS: 'aiSettings',
  CHAT_THEMES: 'chatThemes',
  CHAT_SETTINGS: 'chatSettings',
  BLOCKED_USERS: 'blockedUsers',
};

/** Safely parse JSON from localStorage, falling back to a default value. */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`storage: failed to read "${key}"`, err);
    return fallback;
  }
}

/** Safely write JSON to localStorage. */
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`storage: failed to write "${key}"`, err);
    return false;
  }
}

export const storage = {
  // ---- Users ----
  getUsers() {
    return readJSON(KEYS.USERS, []);
  },
  setUsers(users) {
    return writeJSON(KEYS.USERS, users);
  },

  // ---- Posts ----
  getPosts() {
    return readJSON(KEYS.POSTS, []);
  },
  setPosts(posts) {
    return writeJSON(KEYS.POSTS, posts);
  },

  // ---- Comments ----
  getComments() {
    return readJSON(KEYS.COMMENTS, []);
  },
  setComments(comments) {
    return writeJSON(KEYS.COMMENTS, comments);
  },

  // ---- Likes ----
  getLikes() {
    return readJSON(KEYS.LIKES, []);
  },
  setLikes(likes) {
    return writeJSON(KEYS.LIKES, likes);
  },

  // ---- Current session user ----
  getCurrentUser() {
    return readJSON(KEYS.CURRENT_USER, null);
  },
  setCurrentUser(user) {
    return writeJSON(KEYS.CURRENT_USER, user);
  },
  clearCurrentUser() {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  // ---- Theme (bonus: dark mode) ----
  getTheme() {
    return readJSON(KEYS.THEME, 'light');
  },
  setTheme(theme) {
    return writeJSON(KEYS.THEME, theme);
  },

  // ---- Friend requests ----
  getFriendRequests() {
    return readJSON(KEYS.FRIEND_REQUESTS, []);
  },
  setFriendRequests(requests) {
    return writeJSON(KEYS.FRIEND_REQUESTS, requests);
  },

  // ---- Friends (accepted connections) ----
  getFriends() {
    return readJSON(KEYS.FRIENDS, []);
  },
  setFriends(friends) {
    return writeJSON(KEYS.FRIENDS, friends);
  },

  // ---- Notifications ----
  getNotifications() {
    return readJSON(KEYS.NOTIFICATIONS, []);
  },
  setNotifications(notifications) {
    return writeJSON(KEYS.NOTIFICATIONS, notifications);
  },

  // ---- Stories ----
  getStories() {
    return readJSON(KEYS.STORIES, []);
  },
  setStories(stories) {
    return writeJSON(KEYS.STORIES, stories);
  },

  // ---- Chat: messages (all conversations, flat array — see chatHelpers.js) ----
  getMessages() {
    return readJSON(KEYS.MESSAGES, []);
  },
  setMessages(messages) {
    return writeJSON(KEYS.MESSAGES, messages);
  },

  // ---- Chat: presence (per-user lastSeen timestamp, drives the online dot) ----
  getPresence() {
    return readJSON(KEYS.PRESENCE, {});
  },
  setPresence(presence) {
    return writeJSON(KEYS.PRESENCE, presence);
  },

  // ---- Chat: typing status (per-conversation, per-user timestamp; self-expiring) ----
  getTypingStatus() {
    return readJSON(KEYS.TYPING_STATUS, {});
  },
  setTypingStatus(typingStatus) {
    return writeJSON(KEYS.TYPING_STATUS, typingStatus);
  },

  // ---- AI: per-user settings (aiChatEnabled = Mode 2 auto-reply, aiPersonality = bonus) ----
  getAISettings() {
    return readJSON(KEYS.AI_SETTINGS, {});
  },
  setAISettings(aiSettings) {
    return writeJSON(KEYS.AI_SETTINGS, aiSettings);
  },

  // ---- Chat: per-conversation theme, e.g. { 'usr_a_usr_b': { themeId: 'love', ... } } ----
  getChatThemes() {
    return readJSON(KEYS.CHAT_THEMES, {});
  },
  setChatThemes(chatThemes) {
    return writeJSON(KEYS.CHAT_THEMES, chatThemes);
  },

  // ---- Chat: per-conversation, per-viewer settings (mute/archive/hide/nickname) ----
  getChatSettings() {
    return readJSON(KEYS.CHAT_SETTINGS, {});
  },
  setChatSettings(chatSettings) {
    return writeJSON(KEYS.CHAT_SETTINGS, chatSettings);
  },

  // ---- Blocking is a global relationship (not per-conversation) ----
  getBlockedUsers() {
    return readJSON(KEYS.BLOCKED_USERS, {});
  },
  setBlockedUsers(blockedUsers) {
    return writeJSON(KEYS.BLOCKED_USERS, blockedUsers);
  },
};

/**
 * Generate a reasonably-unique id for new records.
 * e.g. generateId('usr') -> "usr_1737012345678_x7f2q9"
 */
export function generateId(prefix = 'id') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}
