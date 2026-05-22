import { TIME_SLOTS } from './constants';

export type BookingSlotCandidate = {
  time_slot: string;
  duration_minutes: number;
  status: string;
};

export function slotToMinutes(timeSlot: string): number {
  const [h, m] = timeSlot.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** True when the appointment date is today and the slot start time is not after now. */
export function isSlotInPast(date: string, timeSlot: string, now: Date = new Date()): boolean {
  const day = date.slice(0, 10);
  if (day !== toLocalDateString(now)) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return slotToMinutes(timeSlot) < currentMinutes;
}

export const PAST_SLOT_MESSAGE =
  'This time has already passed. Please choose a later time slot.';

/** Drops slots that have already started when booking for today. */
export function slotsForSelectedDate(
  date: string,
  allSlots: readonly string[],
  now: Date = new Date(),
): string[] {
  if (!date) return [];
  return allSlots.filter((slot) => !isSlotInPast(date, slot, now));
}

export function assertSlotNotInPast(date: string, timeSlot: string, now?: Date): void {
  if (isSlotInPast(date, timeSlot, now)) {
    throw new Error(PAST_SLOT_MESSAGE);
  }
}

/** True if a new appointment would overlap an existing one for the same staff member. */
export function isSlotBlockedForNewBooking(
  slot: string,
  newDurationMinutes: number,
  existingBookings: BookingSlotCandidate[],
): boolean {
  if (newDurationMinutes <= 0) return false;

  const newStart = slotToMinutes(slot);
  const newEnd = newStart + newDurationMinutes;

  return existingBookings
    .filter((b) => b.status !== 'cancelled')
    .some((b) => {
      const start = slotToMinutes(b.time_slot);
      const end = start + (b.duration_minutes || 30);
      return newStart < end && newEnd > start;
    });
}

export function getAvailableSlots(
  allSlots: readonly string[],
  newDurationMinutes: number,
  existingBookings: BookingSlotCandidate[],
): string[] {
  return allSlots.filter(
    (slot) => !isSlotBlockedForNewBooking(slot, newDurationMinutes, existingBookings),
  );
}

export function getBookedSlots(
  allSlots: readonly string[],
  newDurationMinutes: number,
  existingBookings: BookingSlotCandidate[],
): string[] {
  return allSlots.filter((slot) =>
    isSlotBlockedForNewBooking(slot, newDurationMinutes, existingBookings),
  );
}

export const STAFF_SLOT_CONFLICT_MESSAGE =
  'This stylist is already booked at the selected time. Please choose another time or another professional.';

export function assertStaffSlotAvailable(
  employeeId: string,
  date: string,
  timeSlot: string,
  durationMinutes: number,
  bookings: Array<BookingSlotCandidate & { employee_id?: string; date?: string }>,
): void {
  const sameDay = bookings.filter(
    (b) => b.employee_id === employeeId && b.date === date,
  );
  if (isSlotBlockedForNewBooking(timeSlot, durationMinutes, sameDay)) {
    throw new Error(STAFF_SLOT_CONFLICT_MESSAGE);
  }
}

export { TIME_SLOTS };
