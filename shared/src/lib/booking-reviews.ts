import type { Booking, BookingStatus, PaymentStatus, Review } from '../types';
import { bookingEndMinutes, slotToMinutes } from './booking-slots';

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** True once the scheduled service window has ended (date passed, or today's end time reached). */
export function isAppointmentTimeReached(
  booking: Pick<Booking, 'date' | 'time_slot' | 'duration_minutes'>,
  now: Date = new Date(),
): boolean {
  const day = booking.date.slice(0, 10);
  const today = toLocalDateString(now);
  if (day < today) return true;
  if (day > today) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const endMinutes = bookingEndMinutes(booking.time_slot, booking.duration_minutes);
  return currentMinutes >= endMinutes;
}

/** Booking must be approved by the salon (not pending/cancelled). */
export function isBookingConfirmedForReview(status: BookingStatus): boolean {
  return status === 'confirmed' || status === 'completed';
}

/** Payment must be marked paid before a review is allowed. */
export function isPaymentConfirmedForReview(paymentStatus: PaymentStatus | string): boolean {
  return paymentStatus === 'paid';
}

/**
 * Customer may review after the booking is confirmed, payment is paid,
 * and the scheduled service window has finished.
 */
export function canReviewBooking(booking: Booking, now: Date = new Date()): boolean {
  return (
    isBookingConfirmedForReview(booking.status) &&
    isPaymentConfirmedForReview(booking.payment_status) &&
    isAppointmentTimeReached(booking, now)
  );
}

/** Short hint when a review cannot be submitted yet. */
export function reviewUnavailableMessage(booking: Booking, now: Date = new Date()): string | null {
  if (booking.status === 'cancelled' || booking.status === 'no_show') return null;

  if (!isBookingConfirmedForReview(booking.status)) {
    return 'Review available after your booking is confirmed, payment is complete, and the visit has finished';
  }

  if (!isPaymentConfirmedForReview(booking.payment_status)) {
    return 'Review available once payment is confirmed';
  }

  if (!isAppointmentTimeReached(booking, now)) {
    return 'Review will be available after your appointment is complete';
  }

  return null;
}

export function hasReviewForBooking(reviews: Review[], bookingId: string): boolean {
  return reviews.some((r) => r.booking_id === bookingId);
}

export function averageRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
