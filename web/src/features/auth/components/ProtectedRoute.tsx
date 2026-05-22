import { useAuth } from '@/features/auth/context/AuthContext';
import type { UserRole } from '@/shared/types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

type ProtectedRouteProps = {
  role?: UserRole;
};

export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />;
  }

  return <Outlet />;
}
