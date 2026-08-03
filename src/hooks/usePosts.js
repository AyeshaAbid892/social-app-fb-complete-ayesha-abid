import { useState, useCallback, useEffect } from 'react';
import { storage, generateId } from '../utils/storage';

/**
 * Central hook for all post/like/comment/bookmark CRUD against localStorage.
 * Every component that touches posts/likes/comments goes through this hook
 * instead of calling storage.js directly, so re-renders stay in sync.
 */
export function usePosts() {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  // Keep in sync if localStorage changes in another tab
  useEffect(() => {
    const onStorage = () => bump();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [bump]);

  const getAllPosts = useCallback(() => storage.getPosts(), [version]);

  const getPublicPosts = useCallback(() => {
    return storage
      .getPosts()
      .filter((p) => p.isPublic && !p.isDraft)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [version]);

  const getUserPosts = useCallback((userId) => {
    return storage
      .getPosts()
      .filter((p) => p.authorId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [version]);

  const getUserPublicPosts = useCallback((userId) => {
    return storage
      .getPosts()
      .filter((p) => p.authorId === userId && p.isPublic && !p.isDraft)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [version]);

  const getPostById = useCallback((postId) => {
    return storage.getPosts().find((p) => p.id === postId) || null;
  }, [version]);

  const createPost = useCallback(({ authorId, description, image, isPublic, isDraft }) => {
    const posts = storage.getPosts();
    const now = new Date().toISOString();
    const newPost = {
      id: generateId('post'),
      authorId,
      description,
      image: image || null,
      isPublic: !!isPublic,
      isDraft: !!isDraft,
      createdAt: now,
      updatedAt: now,
    };
    storage.setPosts([newPost, ...posts]);
    bump();
    return newPost;
  }, [bump]);

  const updatePost = useCallback((postId, updates) => {
    const posts = storage.getPosts();
    const next = posts.map((p) =>
      p.id === postId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    storage.setPosts(next);
    bump();
  }, [bump]);

  const deletePost = useCallback((postId) => {
    storage.setPosts(storage.getPosts().filter((p) => p.id !== postId));
    storage.setComments(storage.getComments().filter((c) => c.postId !== postId));
    storage.setLikes(storage.getLikes().filter((l) => l.postId !== postId));
    bump();
  }, [bump]);

  const togglePostVisibility = useCallback((postId) => {
    const posts = storage.getPosts();
    const next = posts.map((p) =>
      p.id === postId ? { ...p, isPublic: !p.isPublic, updatedAt: new Date().toISOString() } : p
    );
    storage.setPosts(next);
    bump();
  }, [bump]);

  const publishDraft = useCallback((postId) => {
    updatePost(postId, { isDraft: false, isPublic: true });
  }, [updatePost]);

  const incrementViews = useCallback((postId) => {
    const posts = storage.getPosts();
    storage.setPosts(posts.map((p) => (p.id === postId ? { ...p, views: (p.views || 0) + 1 } : p)));
    bump();
  }, [bump]);

  // ---- Likes ----
  const getLikesForPost = useCallback((postId) => {
    return storage.getLikes().filter((l) => l.postId === postId);
  }, [version]);

  const hasUserLiked = useCallback((postId, userId) => {
    if (!userId) return false;
    return storage.getLikes().some((l) => l.postId === postId && l.userId === userId);
  }, [version]);

  const toggleLike = useCallback((postId, userId) => {
    const likes = storage.getLikes();
    const existing = likes.find((l) => l.postId === postId && l.userId === userId);
    if (existing) {
      storage.setLikes(likes.filter((l) => l.id !== existing.id));
    } else {
      storage.setLikes([
        ...likes,
        { id: generateId('like'), postId, userId, createdAt: new Date().toISOString() },
      ]);
    }
    bump();
  }, [bump]);

  // ---- Comments ----
  const getCommentsForPost = useCallback((postId) => {
    return storage
      .getComments()
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [version]);

  const addComment = useCallback((postId, authorId, text) => {
    const comments = storage.getComments();
    const newComment = {
      id: generateId('cmt'),
      postId,
      authorId,
      text,
      createdAt: new Date().toISOString(),
    };
    storage.setComments([...comments, newComment]);
    bump();
    return newComment;
  }, [bump]);

  const deleteComment = useCallback((commentId) => {
    storage.setComments(storage.getComments().filter((c) => c.id !== commentId));
    bump();
  }, [bump]);

  // ---- Bookmarks (bonus) ----
  const toggleBookmark = useCallback((postId, currentUser, updateCurrentUser) => {
    if (!currentUser) return;
    const bookmarks = currentUser.bookmarks || [];
    const next = bookmarks.includes(postId)
      ? bookmarks.filter((id) => id !== postId)
      : [...bookmarks, postId];
    updateCurrentUser({ bookmarks: next });
  }, []);

  return {
    version,
    getAllPosts,
    getPublicPosts,
    getUserPosts,
    getUserPublicPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    togglePostVisibility,
    publishDraft,
    incrementViews,
    getLikesForPost,
    hasUserLiked,
    toggleLike,
    getCommentsForPost,
    addComment,
    deleteComment,
    toggleBookmark,
  };
}
