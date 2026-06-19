import { averageRating, canReviewBooking } from './booking-reviews';
import type { Booking, Review } from '../types';

export function approvedReviewsForService(reviews: Review[], serviceId: string): Review[] {
  return reviews.filter((r) => r.service_id === serviceId && r.status === 'approved');
}

export function serviceRatingSummary(reviews: Review[], serviceId: string): {
  average: number;
  count: number;
} {
  const approved = approvedReviewsForService(reviews, serviceId);
  return {
    average: averageRating(approved),
    count: approved.length,
  };
}

export function hasReviewForService(
  reviews: Review[],
  customerEmail: string,
  serviceId: string,
): boolean {
  const email = customerEmail.trim().toLowerCase();
  return reviews.some(
    (r) => r.service_id === serviceId && r.customer_email.trim().toLowerCase() === email,
  );
}

export function qualifyingBookingsForServiceReview(
  bookings: Booking[],
  serviceId: string,
  customerEmail: string,
): Booking[] {
  const email = customerEmail.trim().toLowerCase();
  return bookings.filter(
    (b) =>
      b.service_id === serviceId &&
      b.customer_email.trim().toLowerCase() === email &&
      canReviewBooking(b),
  );
}

/** Customer may review a service after a completed, paid visit for that treatment. */
export function canReviewService(
  bookings: Booking[],
  reviews: Review[],
  serviceId: string,
  customerEmail: string,
): boolean {
  if (hasReviewForService(reviews, customerEmail, serviceId)) return false;
  return qualifyingBookingsForServiceReview(bookings, serviceId, customerEmail).length > 0;
}

export function serviceReviewUnavailableMessage(
  bookings: Booking[],
  reviews: Review[],
  serviceId: string,
  customerEmail: string,
): string | null {
  if (hasReviewForService(reviews, customerEmail, serviceId)) {
    return 'You have already reviewed this service';
  }
  const mine = bookings.filter(
    (b) =>
      b.service_id === serviceId &&
      b.customer_email.trim().toLowerCase() === customerEmail.trim().toLowerCase(),
  );
  if (mine.length === 0) {
    return 'Book and complete this service before leaving a review';
  }
  if (!mine.some((b) => canReviewBooking(b))) {
    return 'Review available after your visit is completed and payment is confirmed';
  }
  return null;
}
