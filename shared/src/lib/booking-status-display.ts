import type { BookingStatus, PaymentStatus } from '../types';

/** Human-readable booking lifecycle labels for admin and customer UIs. */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending approval',
  confirmed: 'Accepted',
  completed: 'Served',
  cancelled: 'Cancelled',
  no_show: 'No-show',
};

/** Short context shown under the badge where space allows. */
export const BOOKING_STATUS_HINTS: Partial<Record<BookingStatus, string>> = {
  pending: 'Salon has not accepted this booking yet',
  confirmed: 'Booking accepted — visit not completed yet',
  completed: 'Customer was served',
  cancelled: 'Booking was cancelled or rejected',
  no_show: 'Customer did not attend',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Payment pending',
  paid: 'Paid',
  refunded: 'Refunded',
};

export const PAYMENT_STATUS_HINTS: Partial<Record<PaymentStatus, string>> = {
  unpaid: 'Payment not recorded yet',
  paid: 'Payment received',
  refunded: 'Payment was refunded',
};

export function bookingStatusLabel(status: string): string {
  return BOOKING_STATUS_LABELS[status as BookingStatus] ?? status.replace(/_/g, ' ');
}

export function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status as PaymentStatus] ?? status.replace(/_/g, ' ');
}

export function bookingStatusHint(status: string): string | undefined {
  return BOOKING_STATUS_HINTS[status as BookingStatus];
}

export function paymentStatusHint(status: string): string | undefined {
  return PAYMENT_STATUS_HINTS[status as PaymentStatus];
}
