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

function formatCouponScopeCount(count: number, singular: string, plural: string): string | null {
  if (count <= 0) return null;
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

/** Compact targeting summary for list cards — counts only, never raw IDs or long name lists. */
export function formatCouponCardScopeSummary(
  coupon: Pick<Coupon, 'branch_ids' | 'category_ids' | 'customer_emails'>,
): string | null {
  const parts: string[] = [];
  const salons = formatCouponScopeCount(coupon.branch_ids?.length ?? 0, 'salon', 'salons');
  const categories = formatCouponScopeCount(coupon.category_ids?.length ?? 0, 'category', 'categories');
  const customers = formatCouponScopeCount(coupon.customer_emails?.length ?? 0, 'customer', 'customers');
  if (salons) parts.push(salons);
  if (categories) parts.push(categories);
  if (customers) parts.push(customers);
  return parts.length ? parts.join(' · ') : null;
}

export function hasCouponTargeting(
  coupon: Pick<Coupon, 'branch_ids' | 'category_ids' | 'customer_emails'>,
): boolean {
  return formatCouponCardScopeSummary(coupon) != null;
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
