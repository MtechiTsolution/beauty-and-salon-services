import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/shared/components/ui/button';
import { APP_NAME } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/utils';
import { CalendarDays, LogOut, Menu, Scissors, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Our Branches', path: '/branches' },
  { label: 'Packages', path: '/packages' },
  { label: 'Book Now', path: '/book' },
];

export function CustomerNavbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Scissors className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">{APP_NAME}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === link.path ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/my-bookings"><CalendarDays className="w-4 h-4 mr-1" /> Bookings</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/profile"><User className="w-4 h-4 mr-1" /> {user?.full_name?.split(' ')[0]}</Link>
                </Button>
                {user?.role === 'admin' && (
                  <Button asChild variant="outline" size="sm"><Link to="/admin">Admin</Link></Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => logout()}><LogOut className="w-4 h-4" /></Button>
              </>
            ) : (
              <Button asChild><Link to="/login">Sign in</Link></Button>
            )}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden pb-4 space-y-1">
            {links.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted">
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
