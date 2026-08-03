import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/** Shortcut hook so components never need to import useContext + AuthContext directly. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
