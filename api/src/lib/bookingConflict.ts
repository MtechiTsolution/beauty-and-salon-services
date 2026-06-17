import { slotFitsServiceDuration } from '../../../shared/src/lib/booking-slots.js';
import { TIME_SLOTS } from '../../../shared/src/lib/constants.js';
import { query } from '../db.js';

function slotToMinutes(timeSlot: string): number {
  const [h, m] = timeSlot.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function assertSlotNotInPast(date: string, timeSlot: string, now: Date = new Date()): void {
  const day = date.slice(0, 10);
  if (day !== toLocalDateString(now)) return;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  if (slotToMinutes(timeSlot) < currentMinutes) {
    const err = new Error(
      'This time has already passed. Please choose a later time slot.',
    ) as Error & { status: number };
    err.status = 400;
    throw err;
  }
}

function intervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && endA > startB;
}

export async function assertNoStaffSlotConflict(params: {
  employeeId: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  excludeBookingId?: string;
}): Promise<void> {
  const { employeeId, date, timeSlot, durationMinutes, excludeBookingId } = params;
  const newStart = slotToMinutes(timeSlot);
  const newEnd = newStart + durationMinutes;

  const rows = await query<
    { id: string; time_slot: string; duration_minutes: number; status: string }[]
  >(
    `SELECT id, time_slot, duration_minutes, status FROM bookings
     WHERE employee_id = ? AND booking_date = ? AND status != 'cancelled'`,
    [employeeId, date],
  );

  const conflict = rows.some((row) => {
    if (excludeBookingId && row.id === excludeBookingId) return false;
    const start = slotToMinutes(String(row.time_slot));
    const end = start + Number(row.duration_minutes || 30);
    return intervalsOverlap(newStart, newEnd, start, end);
  });

  if (conflict) {
    const err = new Error(
      'This stylist is already booked at the selected time. Please choose another time or another professional.',
    ) as Error & { status: number };
    err.status = 409;
    throw err;
  }
}

/** Skip conflict checks for cancelled bookings; validate schedule otherwise. */
export async function assertActiveBookingSchedule(params: {
  employeeId: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  status: string;
  excludeBookingId?: string;
}): Promise<void> {
  if (params.status === 'cancelled') return;
  assertSlotNotInPast(params.date, params.timeSlot);
  if (!slotFitsServiceDuration(params.timeSlot, params.durationMinutes, TIME_SLOTS)) {
    const err = new Error(
      'This appointment is too long to finish before closing. Please choose an earlier time.',
    ) as Error & { status: number };
    err.status = 400;
    throw err;
  }
  await assertNoStaffSlotConflict({
    employeeId: params.employeeId,
    date: params.date,
    timeSlot: params.timeSlot,
    durationMinutes: params.durationMinutes,
    excludeBookingId: params.excludeBookingId,
  });
}
