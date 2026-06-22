import { useAuth } from '@/features/auth/context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_APP_URL ?? 'http://localhost:5174';

export function ProtectedRoute() {
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

  if (user?.role === 'admin') {
    window.location.href = ADMIN_APP_URL;
    return null;
  }

  return <Outlet />;
}
