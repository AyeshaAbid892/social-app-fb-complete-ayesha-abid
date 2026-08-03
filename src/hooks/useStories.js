import { useState, useCallback } from 'react';
import { storage, generateId } from '../utils/storage';

const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours, just like the real thing

/** Central hook for stories: create, delete, list active (non-expired), react. */
export function useStories() {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const getActiveStories = useCallback(() => {
    const now = Date.now();
    return storage
      .getStories()
      .filter((s) => now - new Date(s.createdAt).getTime() < STORY_LIFETIME_MS)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [version]);

  const getStoriesByUser = useCallback((userId) => {
    return getActiveStories().filter((s) => s.authorId === userId);
  }, [getActiveStories]);

  /** Active stories grouped by author, most-recently-posted author first. */
  const getGroupedStories = useCallback(() => {
    const active = getActiveStories();
    const map = new Map();
    for (const story of active) {
      if (!map.has(story.authorId)) map.set(story.authorId, []);
      map.get(story.authorId).push(story);
    }
    return Array.from(map.entries()).map(([authorId, stories]) => ({ authorId, stories }));
  }, [getActiveStories]);

  const createStory = useCallback(({ authorId, image, text }) => {
    const newStory = {
      id: generateId('story'),
      authorId,
      image: image || null,
      text: text || '',
      reactions: [], // [{ userId, emoji }]
      createdAt: new Date().toISOString(),
    };
    storage.setStories([...storage.getStories(), newStory]);
    bump();
    return newStory;
  }, [bump]);

  const deleteStory = useCallback((storyId) => {
    storage.setStories(storage.getStories().filter((s) => s.id !== storyId));
    bump();
  }, [bump]);

  const reactToStory = useCallback((storyId, userId, emoji) => {
    storage.setStories(
      storage.getStories().map((s) => {
        if (s.id !== storyId) return s;
        const reactions = (s.reactions || []).filter((r) => r.userId !== userId);
        return { ...s, reactions: [...reactions, { userId, emoji }] };
      })
    );
    bump();
  }, [bump]);

  return { version, getActiveStories, getStoriesByUser, getGroupedStories, createStory, deleteStory, reactToStory };
}
