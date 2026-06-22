import { useAuth } from '@/features/auth/context/AuthContext';
import { CustomerProfileDrawer } from '@/features/layout/CustomerProfileDrawer';
import { useMediaQuery } from '@/features/layout/useMediaQuery';
import { notificationsApi } from '@mit-salon/shared/api';
import { ThemeToggle } from '@mit-salon/shared/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@mit-salon/shared/components/ui/dropdown-menu';
import {
  formatNotificationDate,
  notificationBookingDetailPath,
} from '@mit-salon/shared/lib/notification-ui';
import { cn } from '@mit-salon/shared/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bell, CheckCheck, ChevronDown, LogOut, Moon, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type CustomerProfileMenuProps = {
  className?: string;
};

type PopupView = 'menu' | 'notifications';

function userAvatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B6914&color=fff&size=128&bold=true`;
}

function userInitials(name?: string) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  );
}

function UserAvatar({
  name,
  className,
  size = 'sm',
}: {
  name?: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const displayName = name?.trim() || 'User';
  const initials = useMemo(() => userInitials(displayName), [displayName]);
  const [imgError, setImgError] = useState(false);
  const sizeClass = size === 'md' ? 'h-11 w-11 text-sm' : 'h-8 w-8 text-xs';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-semibold text-primary-foreground ring-2 ring-background',
        sizeClass,
        className,
      )}
    >
      {!imgError ? (
        <img
          src={userAvatarUrl(displayName)}
          alt={displayName}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}

export function CustomerProfileMenu({ className }: CustomerProfileMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState<PopupView>('menu');
  const [loggingOut, setLoggingOut] = useState(false);
  const email = user?.email;

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['customer-notifications', email],
    queryFn: () => notificationsApi.listForUser(email!),
    enabled: !!email,
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

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setView('menu');
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setOpen(false);
      navigate('/landing');
    } finally {
      setLoggingOut(false);
    }
  };

  const firstName = user?.full_name?.split(' ')[0] ?? 'Profile';

  const profileTrigger = (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation',
        className,
      )}
      aria-label="Open profile menu"
      onClick={() => (isMobile ? setDrawerOpen(true) : undefined)}
    >
      <UserAvatar name={user?.full_name} />
      <span className="hidden max-w-[6rem] truncate sm:inline">{firstName}</span>
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  );

  if (isMobile) {
    return (
      <>
        {profileTrigger}
        <CustomerProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            className,
          )}
          aria-label="Open profile menu"
        >
          <UserAvatar name={user?.full_name} />
          <span className="hidden max-w-[6rem] truncate sm:inline">{firstName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          'customer-profile-popup isolate border-border/80 bg-popover p-0 shadow-xl',
          view === 'notifications' ? 'w-[min(92vw,22rem)]' : 'w-[min(92vw,17.5rem)]',
        )}
      >
        {view === 'menu' ? (
          <>
            <div className="customer-profile-popup-header">
              <UserAvatar name={user?.full_name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-semibold leading-tight">
                  {user?.full_name ?? 'Guest'}
                </p>
                {user?.email && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
                )}
              </div>
            </div>

            <div className="customer-profile-popup-body">
              <Link
                to="/profile"
                className="customer-profile-popup-row"
                onClick={() => setOpen(false)}
              >
                <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Profile</span>
              </Link>

              <button
                type="button"
                className="customer-profile-popup-row"
                onClick={() => setView('notifications')}
              >
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

              <div className="customer-profile-popup-divider" />

              <button
                type="button"
                className="customer-profile-popup-row customer-profile-popup-row--danger"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>{loggingOut ? 'Signing out…' : 'Logout'}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="customer-profile-popup-notifications-panel">
            <div className="customer-profile-popup-notifications-toolbar">
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
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
            </div>

            <div className="customer-profile-popup-notifications-list">
              {isLoading ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell className="mx-auto mb-2 h-7 w-7 text-muted-foreground/50" />
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Booking updates will appear here.</p>
                </div>
              ) : (
                <ul>
                  {notifications.map((n) => {
                    const bookingPath = notificationBookingDetailPath(n);
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
                        {bookingPath && (
                          <p className="mt-1.5 text-xs font-medium text-primary">View my booking</p>
                        )}
                      </>
                    );

                    return (
                      <li
                        key={n.id}
                        className={cn(
                          'customer-profile-popup-notification-item',
                          !n.read && 'customer-profile-popup-notification-item--unread',
                          bookingPath && 'customer-profile-popup-notification-item--link',
                        )}
                      >
                        {bookingPath ? (
                          <Link
                            to={bookingPath}
                            className="block"
                            onClick={() => setOpen(false)}
                          >
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
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
