import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolvePaymentStatusOnCancel } from './booking-payment';

describe('resolvePaymentStatusOnCancel', () => {
  it('refunds when a paid booking is cancelled', () => {
    assert.equal(resolvePaymentStatusOnCancel('paid', true), 'refunded');
  });

  it('leaves unpaid bookings unchanged on cancel', () => {
    assert.equal(resolvePaymentStatusOnCancel('unpaid', true), undefined);
  });

  it('does nothing when status is not cancelling', () => {
    assert.equal(resolvePaymentStatusOnCancel('paid', false), undefined);
  });

  it('does not alter already refunded bookings', () => {
    assert.equal(resolvePaymentStatusOnCancel('refunded', true), undefined);
  });
});
