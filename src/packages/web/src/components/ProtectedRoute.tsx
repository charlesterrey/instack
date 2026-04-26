import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-text-secondary text-sm">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    login(window.location.pathname);
    return null;
  }

  return <>{children}</>;
}
