import type { Booking } from '../types';

export type BookingDateRange = {
  from?: string;
  to?: string;
};

export function isBookingDateInRange(date: string, range: BookingDateRange): boolean {
  const { from, to } = range;
  if (!from && !to) return true;
  const d = date.slice(0, 10);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

export function isBookingDateRangeValid(from: string, to: string): boolean {
  if (!from || !to) return true;
  return from <= to;
}

export function filterBookingsByDateRange<T extends Pick<Booking, 'date'>>(
  bookings: T[],
  range: BookingDateRange,
): T[] {
  if (!range.from && !range.to) return bookings;
  return bookings.filter((b) => isBookingDateInRange(b.date, range));
}

export function hasActiveBookingDateRange(range: BookingDateRange): boolean {
  return !!(range.from || range.to);
}

/** Filter any list item with a `created_at` ISO timestamp by calendar date range. */
export function filterByCreatedDateRange<T extends { created_at?: string }>(
  items: T[],
  range: BookingDateRange,
): T[] {
  if (!range.from && !range.to) return items;
  return items.filter((item) => {
    if (!item.created_at) return false;
    return isBookingDateInRange(item.created_at, range);
  });
}
