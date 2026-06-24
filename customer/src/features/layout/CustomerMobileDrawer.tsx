import { customerNavLinks } from '@/features/layout/customer-nav-links';
import {
  CUSTOMER_HOME_PATH,
  handleCustomerHomeClick,
} from '@/features/layout/customer-home-nav';
import { AppLogo } from '@mit-salon/shared/components/AppLogo';import { Button } from '@mit-salon/shared/components/ui/button';
import { cn } from '@mit-salon/shared/lib/utils';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';

const mainNavLinks = customerNavLinks.filter((l) => l.path !== '/profile');
const profileLink = customerNavLinks.find((l) => l.path === '/profile');

type CustomerMobileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CustomerMobileDrawer({ open, onClose }: CustomerMobileDrawerProps) {
  const location = useLocation();

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.classList.add('customer-mobile-menu-open');
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.classList.remove('customer-mobile-menu-open');
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const ProfileIcon = profileLink?.icon;

  return createPortal(
    <div className="customer-drawer-root lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        type="button"
        className="customer-drawer-overlay"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="customer-drawer-panel">
        <div className="customer-drawer-header">
          <Link
            to={CUSTOMER_HOME_PATH}
            onClick={(event) => {
              handleCustomerHomeClick(event, location.pathname);
              onClose();
            }}
            className="min-w-0 flex-1 rounded-lg text-left transition hover:bg-muted/40"
          >
            <AppLogo size="md" showText textClassName="text-lg text-foreground" />
            <p className="mt-1 truncate text-xs text-muted-foreground">Salon booking & care</p>
          </Link>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="customer-drawer-nav" aria-label="Main navigation">
          {mainNavLinks.map((link) => {
            const Icon = link.icon;
            const active =
              location.pathname === link.path ||
              (link.path !== '/book' && location.pathname.startsWith(`${link.path}/`));
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={cn('customer-drawer-link', active && 'customer-drawer-link--active')}
              >
                <span className="customer-drawer-link-icon">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-snug">{link.label}</span>
                  {link.description && (
                    <span className="block text-xs leading-snug text-muted-foreground">
                      {link.description}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {profileLink && ProfileIcon && (
          <div className="customer-drawer-footer">
            <Link
              to={profileLink.path}
              onClick={onClose}
              className={cn(
                'customer-drawer-link',
                location.pathname === profileLink.path && 'customer-drawer-link--active',
              )}
            >
              <span className="customer-drawer-link-icon">
                <ProfileIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium leading-snug">{profileLink.label}</span>
                {profileLink.description && (
                  <span className="block text-xs leading-snug text-muted-foreground">
                    {profileLink.description}
                  </span>
                )}
              </span>
            </Link>
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}
