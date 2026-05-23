import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PageSpinner } from '@/components/ui/spinner';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === 'admin' ? '/admin' : '/menu'}
        replace
      />
    );
  }

  return children;
}