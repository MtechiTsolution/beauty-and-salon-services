import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  detectBookingDateQuickPreset,
  filterBookingsByDateRange,
  getBookingDateQuickPresetRange,
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

  it('getBookingDateQuickPresetRange today', () => {
    const now = new Date(2026, 5, 19, 15, 30);
    const range = getBookingDateQuickPresetRange('today', now);
    assert.deepEqual(range, { from: '2026-06-19', to: '2026-06-19' });
  });

  it('detectBookingDateQuickPreset', () => {
    const now = new Date(2026, 5, 19);
    const todayRange = getBookingDateQuickPresetRange('today', now);
    assert.equal(detectBookingDateQuickPreset(todayRange, now), 'today');
    assert.equal(detectBookingDateQuickPreset({ from: '2026-01-01', to: '2026-01-31' }, now), 'custom');
    assert.equal(detectBookingDateQuickPreset({}, now), null);
  });
});
