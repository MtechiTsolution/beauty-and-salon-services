import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Booking } from '../types';
import {
  EMPTY_BOOKING_LIST_FILTERS,
  filterBookingsByFields,
  hasActiveBookingListFilters,
} from './booking-list-filters';

const sample: Booking[] = [
  {
    id: 'b1',
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
    customer_email: 'jane@example.com',
    customer_name: 'Jane Doe',
    branch_id: 'br1',
    branch_name: 'Downtown',
    service_id: 's1',
    service_title: 'Haircut',
    employee_id: 'e1',
    employee_name: 'Alex',
    date: '2026-06-15',
    time_slot: '10:00',
    duration_minutes: 45,
    price: 50,
    discount: 5,
    final_price: 45,
    coupon_code: 'SAVE5',
    status: 'pending',
    payment_status: 'unpaid',
    payment_method: 'cash',
    notes: 'First visit',
  },
  {
    id: 'b2',
    created_at: '2026-06-02T10:00:00Z',
    updated_at: '2026-06-02T10:00:00Z',
    customer_email: 'john@gmail.com',
    customer_name: 'John Smith',
    branch_id: 'br2',
    branch_name: 'Uptown',
    service_id: 's2',
    service_title: 'Color',
    employee_id: 'e2',
    employee_name: 'Sam',
    date: '2026-06-16',
    time_slot: '14:00',
    duration_minutes: 90,
    price: 120,
    discount: 0,
    final_price: 120,
    status: 'confirmed',
    payment_status: 'paid',
    payment_method: 'card',
  },
];

describe('booking-list-filters', () => {
  it('filterBookingsByFields matches customer email partially', () => {
    const filtered = filterBookingsByFields(sample, { customer_email: 'gmail' });
    assert.deepEqual(filtered.map((b) => b.id), ['b2']);
  });

  it('filterBookingsByFields matches approval status', () => {
    const filtered = filterBookingsByFields(sample, { status: 'pending' });
    assert.deepEqual(filtered.map((b) => b.id), ['b1']);
  });

  it('filterBookingsByFields combines multiple filters', () => {
    const filtered = filterBookingsByFields(sample, {
      branch_name: 'down',
      service_title: 'hair',
    });
    assert.deepEqual(filtered.map((b) => b.id), ['b1']);
  });

  it('hasActiveBookingListFilters', () => {
    assert.equal(hasActiveBookingListFilters(EMPTY_BOOKING_LIST_FILTERS), false);
    assert.equal(hasActiveBookingListFilters({ customer_name: 'Jane' }), true);
  });
});
