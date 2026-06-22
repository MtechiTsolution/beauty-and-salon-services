import type { Booking, BookingStatus } from '../types';

const CUSTOMER_CANCELLABLE: BookingStatus[] = ['pending', 'confirmed'];

export function canCustomerCancelBooking(booking: Booking): boolean {
  return CUSTOMER_CANCELLABLE.includes(booking.status);
}

export function customerCancelConfirmMessage(booking: Booking): string {
  if (booking.payment_status === 'paid') {
    return `Cancel this appointment? Your payment of $${booking.final_price.toFixed(2)} will be refunded.`;
  }
  return 'Cancel this appointment? This cannot be undone.';
}

export function customerCancelConfirmTitle(): string {
  return 'Cancel this booking?';
}

export function customerCancelConfirmDescription(booking: Booking): string {
  if (booking.payment_status === 'paid') {
    return `Your payment of $${booking.final_price.toFixed(2)} will be refunded to you after cancellation.`;
  }
  return 'This appointment will be cancelled. You can book a new visit anytime.';
}
