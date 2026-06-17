import { formatCouponDiscountLabel, formatCouponExpiry } from './coupon-ui';
import type { Coupon, Notification } from '../types';

export const COUPON_NOTIFICATION_TITLE = 'Coupon available for you';

export function buildCouponNotificationMessage(
  coupon: Pick<Coupon, 'code' | 'discount_type' | 'discount_value' | 'min_order' | 'expiry_date'>,
): string {
  const discount = formatCouponDiscountLabel(coupon);
  const parts = [`Your coupon code is ${coupon.code} — ${discount}.`];
  if (Number(coupon.min_order) > 0) {
    parts.push(`Minimum order: $${coupon.min_order}.`);
  }
  const expiry = formatCouponExpiry(coupon.expiry_date);
  if (expiry) parts.push(`Valid until ${expiry}.`);
  parts.push('Apply this code when booking your next appointment.');
  return parts.join(' ');
}

export function isCouponNotification(
  n: Pick<Notification, 'title' | 'reference_id' | 'user_email'>,
): boolean {
  return n.title === COUPON_NOTIFICATION_TITLE && !!n.reference_id && !!n.user_email?.trim();
}

export function extractCouponCodeFromNotificationMessage(message: string): string | null {
  const match = message.match(/Your coupon code is ([A-Z0-9_-]+)/i);
  return match?.[1]?.toUpperCase() ?? null;
}
