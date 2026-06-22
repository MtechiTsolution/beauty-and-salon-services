import { customerNavLinks } from '@/features/layout/customer-nav-links';
import { CustomerMobileDrawer } from '@/features/layout/CustomerMobileDrawer';
import { CustomerProfileMenu } from '@/features/layout/CustomerProfileMenu';
import { AppLogo } from '@mit-salon/shared/components/AppLogo';
import { cn } from '@mit-salon/shared/lib/utils';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const desktopNavLinks = customerNavLinks.filter(
  (l) => l.path !== '/profile',
);

export function CustomerNavbar() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/book' && location.pathname.startsWith(`${path}/`));

  return (
    <>
      <header className="customer-navbar sticky top-0 z-50 border-b border-border/70 bg-background/88 text-foreground backdrop-blur-xl">
        <div className="customer-container-wide">
          <div className="flex h-16 items-center justify-between gap-3 lg:h-20">
            <button
              type="button"
              className="rounded-lg p-1 text-left text-foreground transition hover:bg-muted/60 touch-manipulation lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <AppLogo size="sm" showText textClassName="text-lg text-foreground sm:text-xl" />
            </button>

            <Link to="/landing" className="hidden text-foreground lg:block">
              <AppLogo size="md" showText textClassName="text-xl text-foreground" />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {desktopNavLinks.map((link) => (
                <Link
                  key={link.path}
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

            <div className="flex items-center gap-1 sm:gap-2">
              <CustomerProfileMenu />
            </div>
          </div>
        </div>
      </header>

      <CustomerMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
