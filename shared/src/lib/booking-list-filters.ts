import type { Booking, BookingStatus, PaymentStatus } from '../types';

export type BookingListFilters = {
  customer_name?: string;
  customer_email?: string;
  branch_name?: string;
  service_title?: string;
  employee_name?: string;
  time_slot?: string;
  coupon_code?: string;
  notes?: string;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  payment_method?: string;
};

export const EMPTY_BOOKING_LIST_FILTERS: BookingListFilters = {};

function matchesContains(haystack: string | undefined, needle: string | undefined): boolean {
  const query = needle?.trim().toLowerCase();
  if (!query) return true;
  return (haystack ?? '').toLowerCase().includes(query);
}

export function filterBookingsByFields<T extends Booking>(
  bookings: T[],
  filters: BookingListFilters,
): T[] {
  return bookings.filter((booking) => {
    if (!matchesContains(booking.customer_name, filters.customer_name)) return false;
    if (!matchesContains(booking.customer_email, filters.customer_email)) return false;
    if (!matchesContains(booking.branch_name, filters.branch_name)) return false;
    if (!matchesContains(booking.service_title, filters.service_title)) return false;
    if (!matchesContains(booking.employee_name, filters.employee_name)) return false;
    if (!matchesContains(booking.time_slot, filters.time_slot)) return false;
    if (!matchesContains(booking.coupon_code, filters.coupon_code)) return false;
    if (!matchesContains(booking.notes, filters.notes)) return false;
    if (filters.status && booking.status !== filters.status) return false;
    if (filters.payment_status && booking.payment_status !== filters.payment_status) return false;
    if (filters.payment_method && booking.payment_method !== filters.payment_method) return false;
    return true;
  });
}

export function hasActiveBookingListFilters(filters: BookingListFilters): boolean {
  return Object.values(filters).some((value) => value != null && String(value).trim() !== '');
}
