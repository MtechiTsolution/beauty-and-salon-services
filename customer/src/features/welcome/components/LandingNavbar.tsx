import { useAuth } from '@/features/auth/context/AuthContext';
import {
  CUSTOMER_HOME_PATH,
  handleCustomerHomeClick,
} from '@/features/layout/customer-home-nav';
import { useLandingNavbarScroll } from '@/features/welcome/hooks/useLandingNavbarScroll';
import { AppLogo } from '@mit-salon/shared/components/AppLogo';
import { Button } from '@mit-salon/shared/components/ui/button';
import { cn } from '@mit-salon/shared/lib/utils';
import { useLogoutConfirm } from '@mit-salon/shared/hooks/useLogoutConfirm';
import { CalendarDays, LogIn, LogOut, Menu, UserPlus, X } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
const anchorLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Services', href: '#services' },
  { label: 'Packages', href: '#packages' },
  { label: 'Locations', href: '#locations' },
  { label: 'Reviews', href: '#reviews' },
];

type LandingNavbarProps = {
  className?: string;
};

export function LandingNavbar({ className }: LandingNavbarProps) {
  const { isAuthenticated, logout } = useAuth();
  const scrolled = useLandingNavbarScroll();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { requestLogout, loading: loggingOut, logoutDialog } = useLogoutConfirm(logout, {
    onSuccess: () => {
      setMobileOpen(false);
      navigate('/landing');
    },
  });

  const onHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setMobileOpen(false);
    handleCustomerHomeClick(event, location.pathname);
  };

  return (
    <>
      {logoutDialog}
      <header
      className={cn(
        'landing-navbar fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'landing-navbar--solid border-b' : 'landing-navbar--hero border-b backdrop-blur-md',
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:h-[4.5rem]">
        <Link
          to={CUSTOMER_HOME_PATH}
          className="landing-navbar-brand shrink-0 touch-manipulation xl:hidden"
          onClick={onHomeClick}
        >
          <AppLogo
            size="sm"
            showText
            textClassName={cn(
              'landing-navbar-brand text-base transition-colors sm:text-lg',
              scrolled ? 'text-foreground dark:text-white' : 'text-[rgb(15,10,12)] dark:text-white',
            )}
            imageClassName={scrolled ? 'ring-border/60' : 'ring-white/20'}
          />
        </Link>

        <Link
          to={CUSTOMER_HOME_PATH}
          className="landing-navbar-brand hidden shrink-0 xl:block"
          onClick={onHomeClick}
        >
          <AppLogo
            size="sm"
            showText
            textClassName={cn(
              'landing-navbar-brand text-base transition-colors sm:text-lg',
              scrolled ? 'text-foreground dark:text-white' : 'text-[rgb(15,10,12)] dark:text-white',
            )}
            imageClassName={scrolled ? 'ring-border/60' : 'ring-white/20'}
          />
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {anchorLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="landing-navbar-anchor rounded-full px-3.5 py-2 text-sm font-medium transition"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <Button
              asChild
              size="sm"
              className="customer-accent-btn hidden rounded-full border-0 sm:inline-flex"
            >
              <Link to="/book">
                <CalendarDays className="mr-1.5 h-4 w-4" />
                Book appointment
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  'hidden rounded-full sm:inline-flex',
                  scrolled
                    ? 'text-foreground dark:text-white hover:bg-muted dark:hover:bg-white/10'
                    : 'text-[rgb(15,10,12)] dark:text-white hover:bg-primary/10 dark:hover:bg-white/10',
                )}
              >
                <Link to="/login">
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Sign in
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="customer-accent-btn hidden rounded-full border-0 sm:inline-flex"
              >
                <Link to="/register">
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Get started
                </Link>
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'rounded-full xl:hidden',
              scrolled ? 'text-foreground dark:text-white hover:bg-muted dark:hover:bg-white/10' : 'text-[rgb(15,10,12)] dark:text-white hover:bg-primary/10 dark:hover:bg-white/10',
            )}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          className={cn(
            'landing-mobile-drawer border-t px-4 py-4 sm:px-6 xl:hidden',
            scrolled ? 'landing-mobile-drawer--solid border-border/60 bg-background' : 'landing-mobile-drawer--hero border-border/60 bg-background/95 dark:border-white/10 dark:bg-black/80',
          )}
        >
          <nav className="flex flex-col gap-1">
            {anchorLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="landing-navbar-anchor rounded-xl px-4 py-3 text-sm font-medium transition"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border/40 pt-3">
              {isAuthenticated ? (
                <>
                  <Button asChild className="customer-accent-btn w-full rounded-full border-0">
                    <Link to="/book" onClick={() => setMobileOpen(false)}>
                      Book appointment
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={loggingOut}
                    onClick={requestLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {loggingOut ? 'Signing out…' : 'Logout'}
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild className="customer-accent-btn w-full rounded-full border-0">
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      Get started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
    </>
  );
}
