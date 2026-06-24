import { TIME_SLOTS } from './constants';

export type BookingSlotCandidate = {
  time_slot: string;
  duration_minutes: number;
  status: string;
};

export const SLOT_GRID_MINUTES = 30;

export function slotToMinutes(timeSlot: string): number {
  const [h, m] = timeSlot.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

export function minutesToTimeSlot(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function bookingEndMinutes(timeSlot: string, durationMinutes: number): number {
  return slotToMinutes(timeSlot) + Math.max(durationMinutes, 0);
}

export function formatBookingTimeWindow(timeSlot: string, durationMinutes: number): string {
  if (durationMinutes <= 0) return timeSlot;
  const end = minutesToTimeSlot(bookingEndMinutes(timeSlot, durationMinutes));
  return `${timeSlot} – ${end}`;
}

/** Start–end label for a booking record (falls back to start time only). */
export function formatBookingAppointmentTime(booking: {
  time_slot: string;
  duration_minutes?: number | null;
}): string {
  const duration = Number(booking.duration_minutes ?? 0);
  return duration > 0 ? formatBookingTimeWindow(booking.time_slot, duration) : booking.time_slot;
}

export function bookingAppointmentEndTime(timeSlot: string, durationMinutes: number): string {
  if (durationMinutes <= 0) return timeSlot;
  return minutesToTimeSlot(bookingEndMinutes(timeSlot, durationMinutes));
}

/** Compact label for slot buttons (e.g. `09:00–11:00`). */
export function formatBookingTimeWindowCompact(
  timeSlot: string,
  durationMinutes: number,
): string {
  if (durationMinutes <= 0) return timeSlot;
  const end = minutesToTimeSlot(bookingEndMinutes(timeSlot, durationMinutes));
  return `${timeSlot}–${end}`;
}

/** Last minute of the salon day (last grid start + one slot). */
export function getSalonDayEndMinutes(allSlots: readonly string[] = TIME_SLOTS): number {
  const last = allSlots[allSlots.length - 1];
  if (!last) return 24 * 60;
  return slotToMinutes(last) + SLOT_GRID_MINUTES;
}

/** True when the full service fits before the salon closes. */
export function slotFitsServiceDuration(
  slot: string,
  durationMinutes: number,
  allSlots: readonly string[] = TIME_SLOTS,
): boolean {
  if (durationMinutes <= 0) return true;
  return bookingEndMinutes(slot, durationMinutes) <= getSalonDayEndMinutes(allSlots);
}

export function filterSlotsForServiceDuration(
  allSlots: readonly string[],
  durationMinutes: number,
): string[] {
  return allSlots.filter((slot) => slotFitsServiceDuration(slot, durationMinutes, allSlots));
}

/**
 * Start times spaced by service duration so offered windows never overlap each other
 * (e.g. 120 min → 09:00, 11:00, 13:00 — not 09:00 and 09:30).
 */
export function getServiceStartSlots(
  daySlots: readonly string[],
  durationMinutes: number,
  allDaySlots: readonly string[] = TIME_SLOTS,
): string[] {
  if (durationMinutes <= 0 || daySlots.length === 0) return [...daySlots];

  const salonOpen = slotToMinutes(allDaySlots[0]);
  const lastStart = getSalonDayEndMinutes(allDaySlots) - durationMinutes;
  const firstAvailable = slotToMinutes(daySlots[0]);
  const daySlotMinutes = new Set(daySlots.map(slotToMinutes));

  const starts: string[] = [];
  const k0 = Math.max(0, Math.ceil((firstAvailable - salonOpen) / durationMinutes));

  for (let k = k0; ; k++) {
    const m = salonOpen + k * durationMinutes;
    if (m > lastStart) break;
    if (!daySlotMinutes.has(m)) continue;
    starts.push(minutesToTimeSlot(m));
  }

  return starts;
}

export function intervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && endA > startB;
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

function activeBookings(existingBookings: BookingSlotCandidate[]) {
  return existingBookings.filter((b) => b.status !== 'cancelled');
}

/** True if staff already has any appointment starting at this exact time. */
export function isExactSlotTaken(
  slot: string,
  existingBookings: BookingSlotCandidate[],
): boolean {
  return activeBookings(existingBookings).some((b) => b.time_slot === slot);
}

/** True if a new appointment would overlap an existing one for the same staff member. */
export function isSlotBlockedForNewBooking(
  slot: string,
  newDurationMinutes: number,
  existingBookings: BookingSlotCandidate[],
): boolean {
  const active = activeBookings(existingBookings);

  if (active.some((b) => b.time_slot === slot)) return true;

  if (newDurationMinutes <= 0) return false;

  const newStart = slotToMinutes(slot);
  const newEnd = newStart + newDurationMinutes;

  return active.some((b) => {
    const start = slotToMinutes(b.time_slot);
    const end = bookingEndMinutes(b.time_slot, b.duration_minutes || SLOT_GRID_MINUTES);
    return intervalsOverlap(newStart, newEnd, start, end);
  });
}

/** True when the slot start falls inside an existing appointment window (for calendar display). */
export function isSlotCoveredByExistingBooking(
  slot: string,
  existingBookings: BookingSlotCandidate[],
): boolean {
  const slotStart = slotToMinutes(slot);
  return activeBookings(existingBookings).some((b) => {
    const start = slotToMinutes(b.time_slot);
    const end = bookingEndMinutes(b.time_slot, b.duration_minutes || SLOT_GRID_MINUTES);
    return slotStart >= start && slotStart < end;
  });
}

export function getAvailableSlots(
  allSlots: readonly string[],
  newDurationMinutes: number,
  existingBookings: BookingSlotCandidate[],
  options?: { allDaySlots?: readonly string[] },
): string[] {
  const daySlots = options?.allDaySlots ?? TIME_SLOTS;
  return allSlots.filter(
    (slot) =>
      slotFitsServiceDuration(slot, newDurationMinutes, daySlots) &&
      !isSlotBlockedForNewBooking(slot, newDurationMinutes, existingBookings),
  );
}

export function getBookedSlots(
  allSlots: readonly string[],
  newDurationMinutes: number,
  existingBookings: BookingSlotCandidate[],
  options?: { allDaySlots?: readonly string[] },
): string[] {
  const daySlots = options?.allDaySlots ?? TIME_SLOTS;
  return allSlots.filter(
    (slot) =>
      !slotFitsServiceDuration(slot, newDurationMinutes, daySlots) ||
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
