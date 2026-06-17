import {
  isCouponFullyUsed,
  isCouponPastExpiry,
} from '../../../shared/src/lib/coupon-lifecycle.js';
import {
  buildCouponNotificationMessage,
  COUPON_NOTIFICATION_TITLE,
} from '../../../shared/src/lib/coupon-notify.js';
import { query } from '../db.js';
import { createNotification } from './notifications.js';
import { customerHasUsedCoupon } from './couponValidation.js';

export type CouponNotifyRow = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order?: number;
  max_uses?: number | null;
  used_count?: number;
  expiry_date?: string | null;
  status: string;
};

async function wasCouponNotified(customerEmail: string, couponId: string): Promise<boolean> {
  const rows = await query<{ ok: number }[]>(
    `SELECT 1 AS ok FROM notifications
     WHERE LOWER(user_email) = LOWER(?)
       AND reference_id = ?
       AND title = ?
     LIMIT 1`,
    [customerEmail.trim(), couponId, COUPON_NOTIFICATION_TITLE],
  );
  return rows.length > 0;
}

function couponIsBroadcastable(coupon: CouponNotifyRow): boolean {
  if (coupon.status !== 'active') return false;
  if (isCouponPastExpiry(coupon.expiry_date ?? undefined)) return false;
  if (isCouponFullyUsed(Number(coupon.used_count ?? 0), coupon.max_uses)) return false;
  return true;
}

export async function notifyCustomerOfCoupon(
  customerEmail: string,
  coupon: CouponNotifyRow,
): Promise<boolean> {
  if (!couponIsBroadcastable(coupon)) return false;
  if (await customerHasUsedCoupon(customerEmail, coupon.code)) return false;
  if (await wasCouponNotified(customerEmail, coupon.id)) return false;

  await createNotification({
    title: COUPON_NOTIFICATION_TITLE,
    message: buildCouponNotificationMessage({
      code: String(coupon.code),
      discount_type: coupon.discount_type as 'percentage' | 'fixed',
      discount_value: Number(coupon.discount_value),
      min_order: Number(coupon.min_order ?? 0),
      expiry_date: coupon.expiry_date ?? undefined,
    }),
    type: 'reminder',
    user_email: customerEmail,
    reference_id: coupon.id,
  });
  return true;
}

export async function notifyEligibleCustomersOfCoupon(coupon: CouponNotifyRow): Promise<number> {
  if (!couponIsBroadcastable(coupon)) return 0;

  const customers = await query<{ email: string }[]>(
    `SELECT email FROM users WHERE role = 'customer'`,
  );

  let sent = 0;
  for (const { email } of customers) {
    if (await notifyCustomerOfCoupon(email, coupon)) sent += 1;
  }
  return sent;
}

export async function notifyCustomerOfAllAvailableCoupons(customerEmail: string): Promise<number> {
  const { listAvailableCouponsForCustomer } = await import('./couponValidation.js');
  const coupons = await listAvailableCouponsForCustomer(customerEmail.trim());

  let sent = 0;
  for (const row of coupons) {
    if (
      await notifyCustomerOfCoupon(customerEmail, {
        id: String(row.id),
        code: String(row.code),
        discount_type: String(row.discount_type),
        discount_value: Number(row.discount_value),
        min_order: Number(row.min_order ?? 0),
        max_uses: row.max_uses as number | null | undefined,
        used_count: Number(row.used_count ?? 0),
        expiry_date: (row.expiry_date as string | null | undefined) ?? null,
        status: String(row.status),
      })
    ) {
      sent += 1;
    }
  }
  return sent;
}
