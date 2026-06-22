import { COUPON_NOTIFICATION_TITLE } from './coupon-notify';
import type { Notification } from '../types';

export const notificationTypeColors: Record<Notification['type'], string> = {
  booking: 'bg-blue-100 text-blue-800',
  payment: 'bg-green-100 text-green-800',
  reminder: 'bg-amber-100 text-amber-800',
  system: 'bg-muted text-muted-foreground',
  announcement: 'bg-violet-100 text-violet-800',
};

export function notificationBookingDetailPath(n: Notification): string | null {
  if (!n.reference_id) return null;
  if (n.type === 'booking' || n.type === 'payment') {
    return `/my-bookings/${n.reference_id}`;
  }
  return null;
}

export function notificationActionLink(n: Notification): { to: string; label: string } | null {
  if (n.title === COUPON_NOTIFICATION_TITLE && n.reference_id) {
    return { to: '/book', label: 'Book & apply coupon' };
  }
  const to = notificationBookingDetailPath(n);
  if (!to) return null;
  return { to, label: 'View my booking' };
}

/** Salon broadcast messages sent from the admin Announcements section. */
export function isSalonAnnouncement(n: Notification): boolean {
  return n.type === 'announcement';
}

/** Admin-inbox alerts auto-created when customers book or pay (not manually composed). */
export function isCustomerAppAdminNotification(n: Notification): boolean {
  return !n.user_email?.trim() && !!n.reference_id;
}

export function formatNotificationDate(iso?: string): string {
  if (!iso) return '';
  const d = iso.split('T')[0];
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return d;
  }
}
