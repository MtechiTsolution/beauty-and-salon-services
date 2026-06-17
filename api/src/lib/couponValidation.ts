import {
  effectiveMaxUses,
  isCouponFullyUsed,
  isCouponPastExpiry,
} from '../../../shared/src/lib/coupon-lifecycle.js';
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

/** Persist `expired` on all active coupons past their expiry date. */
export async function expireCouponsPastDate(): Promise<void> {
  await query(
    `UPDATE coupons SET status = 'expired'
     WHERE status = 'active'
       AND expiry_date IS NOT NULL
       AND expiry_date < CURDATE()`,
  );
}

export async function markCouponExpired(couponId: string): Promise<void> {
  await query(`UPDATE coupons SET status = 'expired' WHERE id = ?`, [couponId]);
}

export async function findActiveCouponByCode(code: string) {
  await expireCouponsPastDate();
  const rows = await query<Record<string, unknown>[]>(
    `SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND status = 'active'`,
    [code.trim()],
  );
  const row = rows[0];
  if (!row) return null;

  if (isCouponPastExpiry(row.expiry_date as string | undefined)) {
    await markCouponExpired(String(row.id));
    return null;
  }

  return mapCouponRow(row);
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

export async function listAvailableCouponsForCustomer(
  customerEmail: string,
  orderAmount?: number,
): Promise<Record<string, unknown>[]> {
  await expireCouponsPastDate();
  const rows = await query<Record<string, unknown>[]>(
    `SELECT * FROM coupons WHERE status = 'active' ORDER BY code ASC`,
  );

  const available: Record<string, unknown>[] = [];
  for (const row of rows) {
    if (isCouponPastExpiry(row.expiry_date as string | undefined)) {
      await markCouponExpired(String(row.id));
      continue;
    }
    if (isCouponFullyUsed(Number(row.used_count ?? 0), row.max_uses as number | null | undefined)) {
      continue;
    }
    if (await customerHasUsedCoupon(customerEmail, String(row.code))) {
      continue;
    }
    const minOrder = Number(row.min_order ?? 0);
    if (orderAmount != null && orderAmount < minOrder) {
      continue;
    }
    available.push(mapCouponRow(row));
  }
  return available;
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

  if (isCouponFullyUsed(Number(row.used_count ?? 0), row.max_uses as number | null | undefined)) {
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
    max_uses: 'This coupon has already been used and is no longer available',
    min_order: 'Order amount is below the minimum required for this coupon',
  };
  return messages[reason];
}

export async function redeemCoupon(couponId: string): Promise<void> {
  await query(
    `UPDATE coupons
     SET used_count = used_count + 1,
         status = CASE
           WHEN used_count + 1 >= COALESCE(NULLIF(max_uses, 0), 1) THEN 'inactive'
           ELSE status
         END
     WHERE id = ?`,
    [couponId],
  );
}

export function normalizeCouponMaxUses(maxUses: unknown): number {
  const n = Number(maxUses);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : effectiveMaxUses(null);
}
