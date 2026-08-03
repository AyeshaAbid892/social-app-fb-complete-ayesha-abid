import { createContext, useState, useCallback } from 'react';
import { storage, generateId } from '../utils/storage';
import { sanitizeUser } from '../utils/helpers';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialise straight from localStorage so a page refresh keeps the session alive.
  const [currentUser, setCurrentUser] = useState(() => storage.getCurrentUser());

  const signup = useCallback(({ name, email, password }) => {
    const users = storage.getUsers();
    const emailExists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: generateId('usr'),
      name,
      email,
      password, // NOTE: plain text on purpose — this is a frontend-only demo, no backend/hashing available
      bio: '',
      location: '',
      avatar: null,
      coverImage: null,
      bookmarks: [],
      // Extended "About" fields, all optional, filled in later via Settings/Onboarding
      profession: '',
      work: '',
      education: '',
      relationshipStatus: '',
      website: '',
      phone: '',
      birthday: '',
      onboarded: false,
      joinedAt: new Date().toISOString(),
    };

    storage.setUsers([...users, newUser]);
    // NOTE: intentionally does NOT log the user in here — per spec, signup only
    // creates the account. The person is sent to /login to sign in explicitly.
    return sanitizeUser(newUser);
  }, []);

  const login = useCallback(({ email, password }) => {
    const users = storage.getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      throw new Error('Invalid email or password');
    }
    const safeUser = sanitizeUser(found);
    storage.setCurrentUser(safeUser);
    setCurrentUser(safeUser);
    return safeUser;
  }, []);

  const logout = useCallback(() => {
    storage.clearCurrentUser();
    setCurrentUser(null);
  }, []);

  const updateCurrentUser = useCallback((updatedData) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...updatedData };

      // Persist to the session key
      storage.setCurrentUser(merged);

      // Persist to the users array too, so it survives logout/login
      const users = storage.getUsers();
      const nextUsers = users.map((u) =>
        u.id === merged.id ? { ...u, ...updatedData } : u
      );
      storage.setUsers(nextUsers);

      return merged;
    });
  }, []);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    signup,
    login,
    logout,
    updateCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
