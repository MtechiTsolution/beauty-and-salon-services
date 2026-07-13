import { contactPathForBranch, useBookingBranch } from '@/features/booking/context/BookingBranchContext';
import { customerNavLinks } from '@/features/layout/customer-nav-links';
import { CustomerMobileDrawer } from '@/features/layout/CustomerMobileDrawer';
import { CustomerProfileMenu } from '@/features/layout/CustomerProfileMenu';
import {
  CUSTOMER_HOME_PATH,
  handleCustomerHomeClick,
} from '@/features/layout/customer-home-nav';
import { AppLogo } from '@mit-salon/shared/components/AppLogo';
import { cn } from '@mit-salon/shared/lib/utils';
import { Menu } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useMatch } from 'react-router-dom';

const desktopNavLinks = customerNavLinks.filter(
  (l) => l.path !== '/profile',
);

export function CustomerNavbar() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isBookPage = Boolean(useMatch('/book'));
  const { bookingBranch } = useBookingBranch();

  const navLinks = useMemo(
    () =>
      desktopNavLinks.map((link) =>
        link.path === '/contact' && isBookPage && bookingBranch
          ? { ...link, path: contactPathForBranch(bookingBranch.id) }
          : link,
      ),
    [bookingBranch, isBookPage],
  );

  const onHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    handleCustomerHomeClick(event, location.pathname);
  };

  const isActive = (path: string) => {
    const base = path.split('?')[0];
    return (
      location.pathname === base ||
      (base !== '/book' && location.pathname.startsWith(`${base}/`))
    );
  };

  return (
    <>
      <header className="customer-navbar fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/95 text-foreground backdrop-blur-xl supports-[backdrop-filter]:bg-background/88">
        <div className="customer-container-wide">
          <div className="flex h-16 min-w-0 w-full items-center gap-2 lg:h-20 lg:gap-3">
            <Link
              to={CUSTOMER_HOME_PATH}
              onClick={onHomeClick}
              className="shrink-0 rounded-lg p-1 text-left text-foreground transition hover:bg-muted/60 touch-manipulation lg:hidden"
            >
              <AppLogo size="sm" showText textClassName="text-lg text-foreground sm:text-xl" />
            </Link>

            <Link
              to={CUSTOMER_HOME_PATH}
              onClick={onHomeClick}
              className="hidden shrink-0 text-foreground lg:block"
            >
              <AppLogo size="md" showText textClassName="text-xl text-foreground" />
            </Link>

            <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={`${link.label}-${link.path}`}
                  to={link.path}
                  className={cn(
                    'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    isActive(link.path)
                      ? 'bg-primary text-primary-foreground shadow-sm customer-btn-glow'
                      : 'text-foreground/85 hover:bg-primary/10 hover:text-primary',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
              <CustomerProfileMenu />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted/60 touch-manipulation lg:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <CustomerMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
