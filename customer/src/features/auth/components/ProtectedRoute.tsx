import { useAuth } from '@/features/auth/context/AuthContext';
import { WrongPortalNotice } from '@mit-salon/shared/components/WrongPortalNotice';
import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_APP_URL ?? 'http://localhost:5174';
const SUPER_ADMIN_APP_URL = import.meta.env.VITE_SUPER_ADMIN_APP_URL ?? 'http://localhost:5175';

export function ProtectedRoute() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);

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

  if (user?.role !== 'customer') {
    return (
      <WrongPortalNotice
        signedInRole={user?.role ?? 'unknown'}
        portalTitle="Customer app"
        portalPort="5173"
        otherPortals={[
          { label: 'Salon admin', href: ADMIN_APP_URL, port: '5174' },
          { label: 'Platform super admin', href: SUPER_ADMIN_APP_URL, port: '5175' },
        ]}
        signingOut={signingOut}
        onSignOut={async () => {
          setSigningOut(true);
          try {
            await logout();
          } finally {
            setSigningOut(false);
          }
        }}
      />
    );
  }

  return <Outlet />;
}
