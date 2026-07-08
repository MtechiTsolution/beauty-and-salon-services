import assert from 'node:assert/strict';
import test from 'node:test';
import { formatCouponCardScopeSummary, hasCouponTargeting } from './coupon-ui';

test('formatCouponCardScopeSummary returns null when unrestricted', () => {
  assert.equal(
    formatCouponCardScopeSummary({ branch_ids: [], category_ids: [], customer_emails: [] }),
    null,
  );
});

test('formatCouponCardScopeSummary uses compact counts', () => {
  assert.equal(
    formatCouponCardScopeSummary({
      branch_ids: ['a', 'b'],
      category_ids: ['c'],
      customer_emails: ['x@y.com'],
    }),
    '2 salons · 1 category · 1 customer',
  );
});

test('hasCouponTargeting reflects restrictions', () => {
  assert.equal(hasCouponTargeting({ branch_ids: [], category_ids: [], customer_emails: [] }), false);
  assert.equal(hasCouponTargeting({ branch_ids: ['a'], category_ids: [], customer_emails: [] }), true);
});
