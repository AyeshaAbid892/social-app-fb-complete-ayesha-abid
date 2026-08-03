import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/** Wrap /login and /signup — if already logged in, skip straight to the dashboard. */
export default function RedirectIfAuthed({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
