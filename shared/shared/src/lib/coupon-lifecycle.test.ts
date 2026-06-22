import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  effectiveMaxUses,
  isCouponFullyUsed,
  isCouponPastExpiry,
  resolveCouponStatusOnSave,
} from './coupon-lifecycle';

describe('coupon lifecycle', () => {
  it('treats expiry as end-of-day on the expiry date', () => {
    assert.equal(isCouponPastExpiry('2099-12-31', new Date('2099-12-31T23:59:59Z')), false);
    assert.equal(isCouponPastExpiry('2020-01-01', new Date('2025-06-11T12:00:00Z')), true);
  });

  it('defaults max uses to one redemption', () => {
    assert.equal(effectiveMaxUses(undefined), 1);
    assert.equal(effectiveMaxUses(null), 1);
    assert.equal(effectiveMaxUses(5), 5);
  });

  it('detects fully used coupons', () => {
    assert.equal(isCouponFullyUsed(1, 1), true);
    assert.equal(isCouponFullyUsed(0, 1), false);
  });

  it('marks past expiry as expired on save', () => {
    assert.equal(
      resolveCouponStatusOnSave('active', '2020-01-01'),
      'expired',
    );
  });
});
