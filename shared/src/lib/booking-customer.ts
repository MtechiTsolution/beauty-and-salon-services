import type { Booking, BookingStatus } from '../types';
import { DEFAULT_APP_CURRENCY, formatMoney, type AppCurrencyCode } from './currency';

const CUSTOMER_CANCELLABLE: BookingStatus[] = ['pending', 'confirmed'];

export function canCustomerCancelBooking(booking: Booking): boolean {
  return CUSTOMER_CANCELLABLE.includes(booking.status);
}

export function customerCancelConfirmMessage(
  booking: Booking,
  currency: AppCurrencyCode | string = DEFAULT_APP_CURRENCY,
  rate = 1,
): string {
  if (booking.payment_status === 'paid') {
    return `Cancel this appointment? Your payment of ${formatMoney(booking.final_price, currency, { rate })} will be refunded.`;
  }
  return 'Cancel this appointment? This cannot be undone.';
}

export function customerCancelConfirmTitle(): string {
  return 'Cancel this booking?';
}

export function customerCancelConfirmDescription(
  booking: Booking,
  currency: AppCurrencyCode | string = DEFAULT_APP_CURRENCY,
  rate = 1,
): string {
  if (booking.payment_status === 'paid') {
    return `Your payment of ${formatMoney(booking.final_price, currency, { rate })} will be refunded to you after cancellation.`;
  }
  return 'This appointment will be cancelled. You can book a new visit anytime.';
}
