import { query } from '../db.js';
import { rowDates } from '../utils.js';

const NUMERIC = ['discount_value', 'min_order', 'used_count', 'max_uses'] as const;

export type CouponValidateReason =
  | 'not_found'
  | 'expired'
  | 'already_used'
  | 'max_uses'
  | 'min_order';

export type CouponValidateResult =
  | { ok: true; coupon: Record<string, unknown> }
  | { ok: false; reason: CouponValidateReason };

function mapCouponRow(row: Record<string, unknown>) {
  const out = rowDates(row);
  for (const key of NUMERIC) {
    if (key in out && out[key] != null) (out as Record<string, unknown>)[key] = Number(out[key]);
  }
  return out;
}

export async function findActiveCouponByCode(code: string) {
  const rows = await query<Record<string, unknown>[]>(
    `SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND status = 'active'`,
    [code.trim()],
  );
  return rows[0] ? mapCouponRow(rows[0]) : null;
}

export async function customerHasUsedCoupon(customerEmail: string, code: string): Promise<boolean> {
  const rows = await query<{ used: number }[]>(
    `SELECT 1 AS used FROM bookings
     WHERE LOWER(customer_email) = LOWER(?)
       AND coupon_code IS NOT NULL
       AND UPPER(coupon_code) = UPPER(?)
       AND status != 'cancelled'
     LIMIT 1`,
    [customerEmail.trim(), code.trim()],
  );
  return rows.length > 0;
}

export async function validateCouponForCustomer(
  code: string,
  customerEmail: string,
  orderAmount?: number,
): Promise<CouponValidateResult> {
  const row = await findActiveCouponByCode(code);
  if (!row) {
    return { ok: false, reason: 'not_found' };
  }

  if (row.expiry_date && new Date(String(row.expiry_date)) < new Date()) {
    return { ok: false, reason: 'expired' };
  }

  const maxUses = row.max_uses != null ? Number(row.max_uses) : null;
  const usedCount = Number(row.used_count ?? 0);
  if (maxUses != null && usedCount >= maxUses) {
    return { ok: false, reason: 'max_uses' };
  }

  if (await customerHasUsedCoupon(customerEmail, code)) {
    return { ok: false, reason: 'already_used' };
  }

  const minOrder = Number(row.min_order ?? 0);
  if (orderAmount != null && orderAmount < minOrder) {
    return { ok: false, reason: 'min_order' };
  }

  return { ok: true, coupon: row };
}

export function couponRejectMessage(reason: CouponValidateReason): string {
  const messages: Record<CouponValidateReason, string> = {
    not_found: 'Invalid or inactive coupon code',
    expired: 'This coupon has expired',
    already_used: 'You have already used this coupon. Each customer can use a coupon only once.',
    max_uses: 'This coupon has reached its maximum number of uses',
    min_order: 'Order amount is below the minimum required for this coupon',
  };
  return messages[reason];
}

export async function redeemCoupon(couponId: string): Promise<void> {
  await query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [couponId]);
}
