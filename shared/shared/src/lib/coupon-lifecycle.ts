/** Date-only comparison — coupon is valid through the end of `expiryDate` (YYYY-MM-DD). */
export function isCouponPastExpiry(expiryDate?: string | null, now = new Date()): boolean {
  if (!expiryDate?.trim()) return false;
  const today = now.toISOString().slice(0, 10);
  return expiryDate.trim().slice(0, 10) < today;
}

/** Coupons default to a single global redemption when max_uses is unset. */
export function effectiveMaxUses(maxUses?: number | null): number {
  return maxUses != null && maxUses > 0 ? maxUses : 1;
}

export function isCouponFullyUsed(usedCount: number, maxUses?: number | null): boolean {
  return usedCount >= effectiveMaxUses(maxUses);
}

export function resolveCouponStatusOnSave(
  status: 'active' | 'inactive' | 'expired',
  expiryDate?: string | null,
): 'active' | 'inactive' | 'expired' {
  if (isCouponPastExpiry(expiryDate)) return 'expired';
  if (status === 'expired' && !isCouponPastExpiry(expiryDate)) return 'inactive';
  return status;
}
