import { useAuth } from '@/features/auth/context/AuthContext';
import { customerNavLinks } from '@/features/layout/customer-nav-links';
import {
  CUSTOMER_HOME_PATH,
  handleCustomerHomeClick,
} from '@/features/layout/customer-home-nav';
import { AppLogo } from '@mit-salon/shared/components/AppLogo';
import { Button } from '@mit-salon/shared/components/ui/button';
import { cn } from '@mit-salon/shared/lib/utils';
import { useLogoutConfirm } from '@mit-salon/shared/hooks/useLogoutConfirm';
import { LogOut, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const mainNavLinks = customerNavLinks.filter((l) => l.path !== '/profile');
const profileLink = customerNavLinks.find((l) => l.path === '/profile');

type CustomerMobileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CustomerMobileDrawer({ open, onClose }: CustomerMobileDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { requestLogout, loading: loggingOut, logoutDialog } = useLogoutConfirm(logout, {
    onSuccess: () => {
      onClose();
      navigate('/landing');
    },
  });

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
    <>
      {logoutDialog}
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
            {isAuthenticated && user ? (
              <div
                className={cn(
                  'customer-drawer-profile-row',
                  location.pathname === profileLink.path && 'customer-drawer-profile-row--active',
                )}
              >
                <Link
                  to={profileLink.path}
                  onClick={onClose}
                  className="customer-drawer-profile-row__main"
                >
                  <span className="customer-drawer-link-icon">
                    <ProfileIcon className="h-5 w-5" />
                  </span>
                  <span className="customer-drawer-profile-row__text">
                    <span className="block truncate font-medium leading-snug">{user.full_name}</span>
                    <span className="block truncate text-xs leading-snug text-muted-foreground">{user.email}</span>
                  </span>
                </Link>
                <button
                  type="button"
                  className="customer-drawer-profile-row__logout"
                  onClick={requestLogout}
                  disabled={loggingOut}
                  aria-label={loggingOut ? 'Signing out' : 'Logout'}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={onClose} className="customer-drawer-link">
                <span className="min-w-0 flex-1 font-medium">Sign in</span>
              </Link>
            )}
          </div>
        )}
      </aside>
    </div>
    </>,
    document.body,
  );
}
