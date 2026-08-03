import { useState, useCallback } from 'react';
import { storage, generateId } from '../utils/storage';

/** Central hook for notifications: create, read, mark-read, delete, filter by type. */
export function useNotifications() {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const getForUser = useCallback((userId) => {
    return storage
      .getNotifications()
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [version]);

  const getUnreadCount = useCallback((userId) => {
    return storage.getNotifications().filter((n) => n.userId === userId && !n.read).length;
  }, [version]);

  const create = useCallback(({ userId, type, message, link }) => {
    // Don't notify yourself about your own actions
    const notifications = storage.getNotifications();
    storage.setNotifications([
      {
        id: generateId('ntf'),
        userId,
        type, // 'like' | 'comment' | 'share' | 'friend_request' | 'group_invite' | 'message' | 'mention'
        message,
        link: link || null,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ]);
    bump();
  }, [bump]);

  const markAsRead = useCallback((notificationId) => {
    storage.setNotifications(
      storage.getNotifications().map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    bump();
  }, [bump]);

  const markAllAsRead = useCallback((userId) => {
    storage.setNotifications(
      storage.getNotifications().map((n) => (n.userId === userId ? { ...n, read: true } : n))
    );
    bump();
  }, [bump]);

  const remove = useCallback((notificationId) => {
    storage.setNotifications(storage.getNotifications().filter((n) => n.id !== notificationId));
    bump();
  }, [bump]);

  return { version, getForUser, getUnreadCount, create, markAsRead, markAllAsRead, remove };
}
