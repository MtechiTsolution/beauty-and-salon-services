import {
  effectiveMaxUses,
  isCouponFullyUsed,
  isCouponPastExpiry,
} from './coupon-lifecycle';
import type { Booking, Coupon } from '../types';

export type CouponValidateReason =
  | 'not_found'
  | 'expired'
  | 'already_used'
  | 'max_uses'
  | 'min_order'
  | 'not_applicable';

export type CouponValidateResult =
  | { ok: true; coupon: Coupon }
  | { ok: false; reason: CouponValidateReason };

export type CustomerCouponOption = {
  coupon: Coupon;
  eligible: boolean;
  reason?: CouponValidateReason;
};

export const COUPON_VALIDATE_MESSAGES: Record<CouponValidateReason, string> = {
  not_found: 'Invalid or inactive coupon code',
  expired: 'This coupon has expired',
  already_used: 'You have already used this coupon. Each customer can use a coupon only once.',
  max_uses: 'This coupon has already been used and is no longer available',
  min_order: 'Your order does not meet the minimum amount for this coupon',
  not_applicable: 'This coupon does not apply to this booking, saloon, or customer',
};

export function customerAlreadyUsedCoupon(
  bookings: Pick<Booking, 'customer_email' | 'coupon_code' | 'status'>[],
  customerEmail: string,
  code: string,
): boolean {
  const norm = code.trim().toUpperCase();
  const email = customerEmail.trim().toLowerCase();
  return bookings.some(
    (b) =>
      b.customer_email.trim().toLowerCase() === email &&
      b.coupon_code &&
      b.coupon_code.trim().toUpperCase() === norm &&
      b.status !== 'cancelled',
  );
}

export function validateCouponForCustomer(
  coupon: Coupon | null | undefined,
  options: {
    customerEmail?: string;
    orderAmount?: number;
    bookings?: Pick<Booking, 'customer_email' | 'coupon_code' | 'status'>[];
  },
): CouponValidateResult {
  if (!coupon || coupon.status !== 'active') {
    return { ok: false, reason: 'not_found' };
  }

  if (coupon.status === 'expired' || isCouponPastExpiry(coupon.expiry_date)) {
    return { ok: false, reason: 'expired' };
  }

  if (isCouponFullyUsed(coupon.used_count, coupon.max_uses)) {
    return { ok: false, reason: 'max_uses' };
  }

  if (
    options.customerEmail &&
    options.bookings &&
    customerAlreadyUsedCoupon(options.bookings, options.customerEmail, coupon.code)
  ) {
    return { ok: false, reason: 'already_used' };
  }

  if (options.orderAmount != null && options.orderAmount < coupon.min_order) {
    return { ok: false, reason: 'min_order' };
  }

  return { ok: true, coupon };
}
