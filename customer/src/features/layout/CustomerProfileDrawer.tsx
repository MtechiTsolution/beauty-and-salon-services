import { useAuth } from '@/features/auth/context/AuthContext';
import { notificationsApi } from '@mit-salon/shared/api';
import { ThemeToggle } from '@mit-salon/shared/components/ThemeToggle';
import { Button } from '@mit-salon/shared/components/ui/button';
import {
  formatNotificationDate,
  notificationActionLink,
} from '@mit-salon/shared/lib/notification-ui';
import { cn } from '@mit-salon/shared/lib/utils';
import { useLogoutConfirm } from '@mit-salon/shared/hooks/useLogoutConfirm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bell, CheckCheck, LogOut, Moon, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type CustomerProfileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

type PopupView = 'menu' | 'notifications';

export function CustomerProfileDrawer({ open, onClose }: CustomerProfileDrawerProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState<PopupView>('menu');
  const { requestLogout, loading: loggingOut, logoutDialog } = useLogoutConfirm(logout, {
    onSuccess: () => {
      onClose();
      navigate('/landing');
    },
  });
  const email = user?.email;

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['customer-notifications', email],
    queryFn: () => notificationsApi.listForUser(email!),
    enabled: !!email && open,
    refetchInterval: 30_000,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(email!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-notifications', email] });
      toast.success('All notifications marked as read');
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) {
      setView('menu');
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const handleLogout = () => {
    requestLogout();
  };

  if (!open) return null;

  return (
    <>
      {logoutDialog}
      <div className="customer-profile-drawer-root lg:hidden" role="dialog" aria-modal="true" aria-label="Profile menu">
      <button type="button" className="customer-profile-drawer-overlay" aria-label="Close profile menu" onClick={onClose} />
      <aside className="customer-profile-drawer-panel">
        <div className="customer-profile-drawer-header">
          {view === 'notifications' ? (
            <>
              <button
                type="button"
                className="customer-profile-popup-back"
                onClick={() => setView('menu')}
                aria-label="Back to profile menu"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-semibold">Notifications</p>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="customer-profile-popup-mark-read"
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          ) : (
            <>
              <p className="font-heading text-sm font-semibold">Menu</p>
              <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {view === 'menu' ? (
          <div className="customer-profile-drawer-body">
            <div className="customer-profile-popup-row customer-profile-popup-row--profile">
              <Link to="/profile" className="customer-profile-popup-row__main" onClick={onClose}>
                <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="customer-profile-popup-row__text">
                  <span className="block truncate font-medium leading-snug">
                    {user?.full_name ?? 'Guest'}
                  </span>
                  {user?.email && (
                    <span className="block truncate text-xs leading-snug text-muted-foreground">
                      {user.email}
                    </span>
                  )}
                </span>
              </Link>
              <button
                type="button"
                className="customer-profile-popup-row__logout"
                onClick={handleLogout}
                disabled={loggingOut}
                aria-label={loggingOut ? 'Signing out' : 'Logout'}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
            <button type="button" className="customer-profile-popup-row" onClick={() => setView('notifications')}>
              <Bell className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-left">Notifications</span>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold leading-none text-primary-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="customer-profile-popup-divider" />
            <div className="customer-profile-popup-row customer-profile-popup-row--static">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Moon className="h-4 w-4 shrink-0" />
                Theme
              </span>
              <ThemeToggle variant="compact" />
            </div>
          </div>
        ) : (
          <div className="customer-profile-popup-notifications-list flex-1">
            {isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto mb-2 h-7 w-7 text-muted-foreground/50" />
                <p className="text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => {
                  const action = notificationActionLink(n);
                  const content = (
                    <>
                      <p className="flex items-center gap-1.5 text-sm font-medium leading-snug">
                        <span className="truncate">{n.title}</span>
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        {formatNotificationDate(n.created_at)}
                      </p>
                      {action && (
                        <p className="mt-1.5 text-xs font-medium text-primary">{action.label}</p>
                      )}
                    </>
                  );
                  return (
                    <li
                      key={n.id}
                      className={cn(
                        'customer-profile-popup-notification-item',
                        !n.read && 'customer-profile-popup-notification-item--unread',
                        action && 'customer-profile-popup-notification-item--link',
                      )}
                    >
                      {action ? (
                        <Link to={action.to} className="block" onClick={onClose}>
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </aside>
    </div>
    </>
  );
}

