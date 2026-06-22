import type { Booking, Review } from '../types';
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

/** Customer may review after the visit time has passed, status is completed, and payment is paid. */
export function canReviewBooking(booking: Booking, now: Date = new Date()): boolean {
  return (
    booking.status === 'completed' &&
    booking.payment_status === 'paid' &&
    isAppointmentTimeReached(booking, now)
  );
}

/** Short hint when a review cannot be submitted yet. */
export function reviewUnavailableMessage(booking: Booking, now: Date = new Date()): string | null {
  if (booking.status === 'cancelled') return null;
  if (booking.status !== 'completed') {
    return 'Review available after your visit is completed and payment is confirmed';
  }
  if (booking.payment_status !== 'paid') {
    return 'Review available once payment is marked paid';
  }
  if (!isAppointmentTimeReached(booking, now)) {
    return 'Review will be available after your appointment time';
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
