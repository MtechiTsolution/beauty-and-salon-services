import { useAuth } from '@/features/auth/context/AuthContext';
import { notificationsApi } from '@mit-salon/shared/api';
import { Badge } from '@mit-salon/shared/components/ui/badge';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { NotificationCategoryFilter } from '@mit-salon/shared/components/NotificationCategoryFilter';
import { cn } from '@mit-salon/shared/lib/utils';
import {
  extractCouponCodeFromNotificationMessage,
  isCouponNotification,
} from '@mit-salon/shared/lib/coupon-notify';
import {
  CUSTOMER_NOTIFICATION_FILTERS,
  formatNotificationDate,
  notificationActionLink,
  notificationCategoryLabel,
  notificationFilterCategory,
  notificationTypeColors,
  type NotificationFilterCategory,
} from '@mit-salon/shared/lib/notification-ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const email = user?.email;
  const [category, setCategory] = useState<NotificationFilterCategory>('all');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['customer-notifications', email],
    queryFn: () => notificationsApi.listForUser(email!),
    enabled: !!email,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-notifications', email] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(email!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-notifications', email] });
      toast.success('All notifications marked as read');
    },
  });

  const filteredNotifications = useMemo(() => {
    if (category === 'all') return notifications;
    return notifications.filter((n) => notificationFilterCategory(n) === category);
  }, [notifications, category]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="customer-page customer-notifications-page">
      <div className="customer-container-wide py-8 md:py-16">
        <header className="customer-notifications-header">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-2xl font-bold leading-tight md:text-4xl">Notifications</h1>
              <p className="customer-notifications-lead mt-1 text-sm text-muted-foreground md:mt-2">
                <span className="md:hidden">Bookings, offers & salon updates.</span>
                <span className="hidden md:inline">
                  Booking updates, salon announcements, coupon offers, and payment confirmations.
                </span>
              </p>
            </div>

            {unreadCount > 0 && (
              <div className="customer-notification-unread-stat shrink-0 rounded-xl border border-primary/25 bg-primary/5 px-2.5 py-1.5 text-center md:px-3 md:py-2">
                <p className="text-base font-bold leading-none text-primary tabular-nums md:text-lg">{unreadCount}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Unread</p>
              </div>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="customer-notifications-mark-all mt-3 gap-2 rounded-full md:mt-4"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </header>

        {notifications.length > 0 && (
          <div className="customer-notification-filter mt-4 rounded-xl border border-border/70 bg-card p-3 shadow-sm md:mt-6 md:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <p className="text-xs font-medium text-foreground md:text-sm">Filter by type</p>
              <NotificationCategoryFilter
                value={category}
                onChange={setCategory}
                options={CUSTOMER_NOTIFICATION_FILTERS}
                getCount={(filterId) =>
                  filterId === 'all'
                    ? notifications.length
                    : notifications.filter((n) => notificationFilterCategory(n) === filterId).length
                }
                hideEmpty
                className="sm:max-w-[14rem] sm:shrink-0"
                id="customer-notifications-type-filter"
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground md:mt-10">Loading notifications…</p>
        ) : notifications.length === 0 ? (
          <Card className="customer-notification-empty mt-8 p-8 text-center md:mt-10 md:p-12">
            <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground md:mb-4 md:h-12 md:w-12" />
            <h2 className="font-heading text-base font-semibold md:text-lg">You&apos;re all caught up</h2>
            <p className="customer-notification-empty-copy mt-1.5 text-sm text-muted-foreground">
              <span className="md:hidden">Updates appear here when you book or get offers.</span>
              <span className="hidden md:inline">
                When you book an appointment, receive a coupon offer, or your booking status changes,
                updates will appear here.
              </span>
            </p>
            <Button asChild className="mt-5 md:mt-6">
              <Link to="/book">Book an appointment</Link>
            </Button>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="mt-8 p-8 text-center md:mt-10 md:p-12">
            <p className="text-sm text-muted-foreground">No notifications in this category.</p>
            <Button type="button" variant="outline" className="mt-4 rounded-full" onClick={() => setCategory('all')}>
              Show all notifications
            </Button>
          </Card>
        ) : (
          <div className="customer-notification-list mt-5 space-y-2.5 md:mt-8 md:space-y-3">
            {filteredNotifications.map((n) => {
              const action = notificationActionLink(n);
              const couponCode = isCouponNotification(n)
                ? extractCouponCodeFromNotificationMessage(n.message)
                : null;
              const sectionLabel = notificationCategoryLabel(n);
              const unread = !n.read;

              return (
                <Card
                  key={n.id}
                  className={cn(
                    'customer-notification-item border shadow-sm',
                    unread ? 'border-primary/30 bg-primary/5' : 'border-border/80',
                  )}
                >
                  <CardContent className="flex items-start justify-between gap-2.5 p-3 md:gap-4 md:p-4">
                    <div className="flex min-w-0 items-start gap-2.5 md:gap-3">
                      <div
                        className={cn(
                          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg md:h-9 md:w-9 md:rounded-full',
                          unread ? 'bg-primary/12 text-primary' : 'bg-primary/10 text-primary',
                        )}
                      >
                        <Bell className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                          <h3 className="text-sm font-semibold leading-snug">{n.title}</h3>
                          <Badge className={`${notificationTypeColors[n.type]} border-0 text-[10px] capitalize`}>
                            {sectionLabel}
                          </Badge>
                          {unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />}
                        </div>
                        {couponCode && (
                          <p className="mb-1.5 mt-1.5 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold tracking-wide text-primary md:px-3 md:py-1 md:text-sm">
                            {couponCode}
                          </p>
                        )}
                        <p className="customer-notification-item__message text-muted-foreground" title={n.message}>
                          {n.message}
                        </p>
                        <p className="mt-1.5 text-[11px] text-muted-foreground md:text-xs">
                          {formatNotificationDate(n.created_at)}
                        </p>
                        {action && (
                          <Link
                            to={action.to}
                            className="mt-1.5 inline-block text-[11px] font-medium text-primary hover:underline md:text-xs"
                          >
                            {action.label}
                          </Link>
                        )}
                      </div>
                    </div>
                    {unread && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        aria-label="Mark as read"
                        onClick={() => markRead.mutate(n.id)}
                        disabled={markRead.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
