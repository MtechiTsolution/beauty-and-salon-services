import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  filterBookingsByDateRange,
  hasActiveBookingDateRange,
  isBookingDateInRange,
  isBookingDateRangeValid,
} from './booking-date-filter';

describe('booking-date-filter', () => {
  it('isBookingDateInRange with no bounds returns true', () => {
    assert.equal(isBookingDateInRange('2026-06-15', {}), true);
  });

  it('isBookingDateInRange respects from and to', () => {
    assert.equal(isBookingDateInRange('2026-06-10', { from: '2026-06-15' }), false);
    assert.equal(isBookingDateInRange('2026-06-20', { to: '2026-06-15' }), false);
    assert.equal(isBookingDateInRange('2026-06-15', { from: '2026-06-01', to: '2026-06-30' }), true);
  });

  it('filterBookingsByDateRange filters list', () => {
    const bookings = [
      { id: '1', date: '2026-06-01' },
      { id: '2', date: '2026-06-15' },
      { id: '3', date: '2026-07-01' },
    ];
    const filtered = filterBookingsByDateRange(bookings, { from: '2026-06-10', to: '2026-06-20' });
    assert.deepEqual(filtered.map((b) => b.id), ['2']);
  });

  it('isBookingDateRangeValid', () => {
    assert.equal(isBookingDateRangeValid('', ''), true);
    assert.equal(isBookingDateRangeValid('2026-06-01', '2026-06-30'), true);
    assert.equal(isBookingDateRangeValid('2026-06-30', '2026-06-01'), false);
  });

  it('hasActiveBookingDateRange', () => {
    assert.equal(hasActiveBookingDateRange({}), false);
    assert.equal(hasActiveBookingDateRange({ from: '2026-06-01' }), true);
  });
});
