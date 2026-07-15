import type { Booking, BookingStatus, PaymentStatus } from '../types';
import { isAppointmentTimeReached } from './booking-reviews';

/** Stored on bookings auto-cancelled when the customer never arrived (confirmed no-show). */
export const AUTO_CANCEL_MISSED_APPOINTMENT_REASON =
  'Cancelled by salon — customer did not arrive for the scheduled appointment.';

/** Pending / incomplete bookings whose visit window passed without confirmation or completion. */
export const AUTO_CANCEL_EXPIRED_INCOMPLETE_REASON =
  'Automatically cancelled — the appointment time passed before the booking was confirmed or completed. Any prepaid amount will be refunded.';

const AUTO_CANCEL_STATUSES: BookingStatus[] = ['pending', 'confirmed'];

export function shouldAutoCancelMissedAppointment(
  booking: Pick<Booking, 'status' | 'date' | 'time_slot' | 'duration_minutes'>,
  now: Date = new Date(),
): boolean {
  if (!AUTO_CANCEL_STATUSES.includes(booking.status)) return false;
  return isAppointmentTimeReached(booking, now);
}

/**
 * After the visit window ends, unfinished bookings are cancelled.
 * Covers pending (never confirmed) and confirmed no-shows.
 * Callers should refund paid bookings via resolvePaymentStatusOnCancel.
 */
export function shouldAutoCancelExpiredIncompleteBooking(
  booking: Pick<Booking, 'status' | 'payment_status' | 'date' | 'time_slot' | 'duration_minutes'>,
  now: Date = new Date(),
): boolean {
  return shouldAutoCancelMissedAppointment(booking, now);
}

export function autoCancelReasonFor(
  booking: Pick<Booking, 'status' | 'payment_status'>,
): string {
  if (booking.status === 'pending') return AUTO_CANCEL_EXPIRED_INCOMPLETE_REASON;
  return AUTO_CANCEL_MISSED_APPOINTMENT_REASON;
}

export function willAutoRefundOnCancel(
  paymentStatus: PaymentStatus | string | null | undefined,
): boolean {
  return paymentStatus === 'paid';
}
