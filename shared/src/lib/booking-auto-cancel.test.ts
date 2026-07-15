import { describe, expect, it } from 'vitest';
import {
  AUTO_CANCEL_EXPIRED_INCOMPLETE_REASON,
  AUTO_CANCEL_MISSED_APPOINTMENT_REASON,
  autoCancelReasonFor,
  shouldAutoCancelExpiredIncompleteBooking,
  shouldAutoCancelMissedAppointment,
  willAutoRefundOnCancel,
} from './booking-auto-cancel';

describe('shouldAutoCancelMissedAppointment', () => {
  const base = {
    date: '2026-06-01',
    time_slot: '10:00',
    duration_minutes: 60,
    payment_status: 'unpaid' as const,
  };

  it('cancels pending bookings after the appointment window ends', () => {
    const now = new Date('2026-06-01T11:01:00');
    expect(
      shouldAutoCancelMissedAppointment({ ...base, status: 'pending' }, now),
    ).toBe(true);
    expect(
      shouldAutoCancelExpiredIncompleteBooking({ ...base, status: 'pending' }, now),
    ).toBe(true);
  });

  it('cancels unpaid confirmed bookings after the visit window', () => {
    const now = new Date('2026-06-01T11:01:00');
    expect(
      shouldAutoCancelExpiredIncompleteBooking(
        { ...base, status: 'confirmed', payment_status: 'unpaid' },
        now,
      ),
    ).toBe(true);
  });

  it('cancels paid pending bookings after the visit window (refund path)', () => {
    const now = new Date('2026-06-02T09:00:00');
    expect(
      shouldAutoCancelExpiredIncompleteBooking(
        { ...base, status: 'pending', payment_status: 'paid' },
        now,
      ),
    ).toBe(true);
    expect(willAutoRefundOnCancel('paid')).toBe(true);
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

  it('uses pending vs no-show reasons', () => {
    expect(autoCancelReasonFor({ status: 'pending', payment_status: 'unpaid' })).toBe(
      AUTO_CANCEL_EXPIRED_INCOMPLETE_REASON,
    );
    expect(AUTO_CANCEL_MISSED_APPOINTMENT_REASON).toMatch(/cancelled by salon/i);
    expect(autoCancelReasonFor({ status: 'confirmed', payment_status: 'paid' })).toBe(
      AUTO_CANCEL_MISSED_APPOINTMENT_REASON,
    );
  });
});
