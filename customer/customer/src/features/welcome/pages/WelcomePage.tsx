import { useAuth } from '@/features/auth/context/AuthContext';
import LandingPage from '@/features/welcome/pages/LandingPage';
import { Navigate } from 'react-router-dom';

/** Root route: guests see the landing page; signed-in customers go to booking. */
export default function WelcomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/book" replace />;
  }

  return <LandingPage />;
}
