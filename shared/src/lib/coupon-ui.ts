import type { Coupon } from '../types';

export function formatCouponDiscountLabel(
  coupon: Pick<Coupon, 'discount_type' | 'discount_value'>,
): string {
  return coupon.discount_type === 'percentage'
    ? `${coupon.discount_value}% off`
    : `$${coupon.discount_value} off`;
}

export function formatCouponExpiry(expiryDate?: string | null): string | null {
  if (!expiryDate?.trim()) return null;
  const d = expiryDate.slice(0, 10);
  try {
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return d;
  }
}

export function estimateCouponDiscount(
  coupon: Pick<Coupon, 'discount_type' | 'discount_value'>,
  orderAmount: number,
): number {
  if (orderAmount <= 0) return 0;
  const raw =
    coupon.discount_type === 'percentage'
      ? (orderAmount * coupon.discount_value) / 100
      : coupon.discount_value;
  return Math.min(orderAmount, Math.max(0, raw));
}
