import type { Booking, Review } from '../types';

/** Customer may review only after appointment is done and payment is cleared. */
export function canReviewBooking(booking: Booking): boolean {
  return booking.status === 'completed' && booking.payment_status === 'paid';
}

export function hasReviewForBooking(reviews: Review[], bookingId: string): boolean {
  return reviews.some((r) => r.booking_id === bookingId);
}

export function averageRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
