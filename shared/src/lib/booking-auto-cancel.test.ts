import { describe, expect, it } from 'vitest';
import {
  AUTO_CANCEL_MISSED_APPOINTMENT_REASON,
  shouldAutoCancelMissedAppointment,
} from './booking-auto-cancel';

describe('shouldAutoCancelMissedAppointment', () => {
  const base = {
    date: '2026-06-01',
    time_slot: '10:00',
    duration_minutes: 60,
  };

  it('cancels pending bookings after the appointment window ends', () => {
    const now = new Date('2026-06-01T11:01:00');
    expect(
      shouldAutoCancelMissedAppointment({ ...base, status: 'pending' }, now),
    ).toBe(true);
  });

  it('does not cancel before the appointment window ends', () => {
    const now = new Date('2026-06-01T10:30:00');
    expect(
      shouldAutoCancelMissedAppointment({ ...base, status: 'confirmed' }, now),
    ).toBe(false);
  });

  it('does not cancel completed bookings', () => {
    const now = new Date('2026-06-01T12:00:00');
    expect(
      shouldAutoCancelMissedAppointment({ ...base, status: 'completed' }, now),
    ).toBe(false);
  });

  it('exports a clear salon-initiated no-show reason', () => {
    expect(AUTO_CANCEL_MISSED_APPOINTMENT_REASON).toMatch(/cancelled by salon/i);
    expect(AUTO_CANCEL_MISSED_APPOINTMENT_REASON).toMatch(/did not arrive/i);
  });
});
