import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  filterSlotsForServiceDuration,
  formatBookingTimeWindow,
  formatBookingTimeWindowCompact,
  getAvailableSlots,
  getServiceStartSlots,
  isSlotBlockedForNewBooking,
  slotFitsServiceDuration,
} from './booking-slots.js';
import { packageDurationMinutes } from './package-duration.js';
import type { Package, Service } from '../types/index.js';

describe('packageDurationMinutes', () => {
  const services: Service[] = [
    {
      id: 's1',
      title: 'Cut',
      price: 30,
      duration_minutes: 60,
      category_id: 'c1',
      branch_ids: [],
      employee_ids: [],
      status: 'active',
      created_at: '',
      updated_at: '',
    },
    {
      id: 's2',
      title: 'Color',
      price: 80,
      duration_minutes: 60,
      category_id: 'c1',
      branch_ids: [],
      employee_ids: [],
      status: 'active',
      created_at: '',
      updated_at: '',
    },
  ];

  const pkg: Package = {
    id: 'p1',
    name: 'Combo',
    price: 100,
    service_ids: ['s1', 's2'],
    branch_ids: [],
    total_sessions: 1,
    validity_days: 30,
    status: 'active',
    created_at: '',
    updated_at: '',
  };

  it('sums included service durations', () => {
    assert.equal(packageDurationMinutes(pkg, services), 120);
  });
});

describe('isSlotBlockedForNewBooking', () => {
  const existing = [
    { time_slot: '11:00', duration_minutes: 120, status: 'confirmed' },
  ];

  it('blocks overlapping 2h booking starting at 10:00', () => {
    assert.equal(isSlotBlockedForNewBooking('10:00', 120, existing), true);
  });

  it('allows non-overlapping booking ending before 11:00', () => {
    assert.equal(isSlotBlockedForNewBooking('09:00', 60, existing), false);
  });

  it('ignores cancelled bookings', () => {
    const cancelled = [{ time_slot: '11:00', duration_minutes: 120, status: 'cancelled' }];
    assert.equal(isSlotBlockedForNewBooking('10:00', 120, cancelled), false);
  });
});

describe('formatBookingTimeWindow', () => {
  it('formats start and end', () => {
    assert.equal(formatBookingTimeWindow('10:00', 120), '10:00 – 12:00');
  });
});

describe('formatBookingTimeWindowCompact', () => {
  it('formats without spaces around dash', () => {
    assert.equal(formatBookingTimeWindowCompact('09:00', 30), '09:00–09:30');
    assert.equal(formatBookingTimeWindowCompact('09:00', 120), '09:00–11:00');
  });
});

describe('slotFitsServiceDuration', () => {
  const slots = ['09:00', '09:30', '18:00', '18:30', '19:00'] as const;

  it('allows 30 min ending at salon close', () => {
    assert.equal(slotFitsServiceDuration('19:00', 30, slots), true);
  });

  it('rejects 120 min starting too late', () => {
    assert.equal(slotFitsServiceDuration('18:00', 120, slots), false);
    assert.equal(slotFitsServiceDuration('09:00', 120, slots), true);
  });
});

describe('filterSlotsForServiceDuration', () => {
  const slots = ['09:00', '18:00', '18:30', '19:00'] as const;

  it('drops starts that cannot fit a long service', () => {
    const filtered = filterSlotsForServiceDuration(slots, 120);
    assert.ok(filtered.includes('09:00'));
    assert.ok(!filtered.includes('18:00'));
    assert.ok(!filtered.includes('18:30'));
  });
});

describe('getServiceStartSlots', () => {
  const daySlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '17:00', '17:30', '18:00', '18:30', '19:00',
  ] as const;
  const salonSlots = daySlots;

  it('spaces 120 min starts without overlap (09:00, 11:00, …)', () => {
    const starts = getServiceStartSlots(daySlots, 120, salonSlots);
    assert.deepEqual(starts, ['09:00', '11:00', '13:00', '17:00']);
    assert.ok(!starts.includes('09:30'));
    assert.ok(!starts.includes('10:00'));
  });

  it('offers every 30 min for a 30 min service', () => {
    const starts = getServiceStartSlots(daySlots, 30, salonSlots);
    assert.equal(starts.length, daySlots.length);
    assert.equal(starts[0], '09:00');
    assert.equal(starts[1], '09:30');
  });

  it('blocks 120 min starts that overlap an existing 09:00–11:00 booking', () => {
    const existing = [{ time_slot: '09:00', duration_minutes: 120, status: 'confirmed' }];
    const starts = getServiceStartSlots(daySlots, 120, salonSlots);
    const available = getAvailableSlots(starts, 120, existing, { allDaySlots: salonSlots });
    assert.deepEqual(available, ['11:00', '13:00', '17:00']);
  });
});

describe('getAvailableSlots', () => {
  const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00'] as const;
  const existing = [{ time_slot: '11:00', duration_minutes: 120, status: 'confirmed' }];

  it('excludes starts that would overlap a long existing booking', () => {
    const available = getAvailableSlots(slots, 120, existing);
    assert.ok(!available.includes('10:00'));
    assert.ok(!available.includes('10:30'));
    assert.ok(!available.includes('11:00'));
    assert.ok(available.includes('09:00'));
    assert.ok(!available.includes('12:00'));
    assert.ok(available.includes('13:00'));
  });
});
