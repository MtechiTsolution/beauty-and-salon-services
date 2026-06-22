import { useAuth } from '@/features/auth/context/AuthContext';
import { notificationsApi } from '@mit-salon/shared/api';
import { Badge } from '@mit-salon/shared/components/ui/badge';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import {
  extractCouponCodeFromNotificationMessage,
  isCouponNotification,
} from '@mit-salon/shared/lib/coupon-notify';
import {
  formatNotificationDate,
  isSalonAnnouncement,
  notificationActionLink,
  notificationTypeColors,
} from '@mit-salon/shared/lib/notification-ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const email = user?.email;

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="customer-page">
      <div className="customer-container-wide py-12 md:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold md:text-4xl">Notifications</h1>
            <p className="mt-2 text-muted-foreground">
              Booking updates, salon announcements, coupon offers, and payment confirmations for your account.
              {unreadCount > 0 && ` · ${unreadCount} unread`}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="outline"
              className="gap-2 shrink-0"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <p className="mt-10 text-muted-foreground">Loading notifications…</p>
        ) : notifications.length === 0 ? (
          <Card className="mt-10 p-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="font-heading text-lg font-semibold">You&apos;re all caught up</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              When you book an appointment, receive a coupon offer, or your booking status changes,
              updates will appear here.
            </p>
            <Button asChild className="mt-6">
              <Link to="/book">Book an appointment</Link>
            </Button>
          </Card>
        ) : (
          <div className="mt-8 space-y-3">
            {notifications.map((n) => {
              const action = notificationActionLink(n);
              const couponCode = isCouponNotification(n)
                ? extractCouponCodeFromNotificationMessage(n.message)
                : null;
              return (
                <Card
                  key={n.id}
                  className={!n.read ? 'border-primary/30 bg-primary/5' : 'border-border/80'}
                >
                  <CardContent className="flex items-start justify-between gap-4 p-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold">{n.title}</h3>
                          <Badge className={`${notificationTypeColors[n.type]} border-0 capitalize text-[10px]`}>
                            {isSalonAnnouncement(n) ? 'Salon update' : n.type}
                          </Badge>
                          {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        {couponCode && (
                          <p className="mb-2 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-sm font-bold tracking-wide text-primary">
                            {couponCode}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">{n.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatNotificationDate(n.created_at)}
                        </p>
                        {action && (
                          <Link
                            to={action.to}
                            className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                          >
                            {action.label}
                          </Link>
                        )}
                      </div>
                    </div>
                    {!n.read && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
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
