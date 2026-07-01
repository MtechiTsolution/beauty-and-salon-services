import type { Booking, BookingStatus } from '../types';
import { isAppointmentTimeReached } from './booking-reviews';

/** Stored on bookings auto-cancelled when the customer never arrived. */
export const AUTO_CANCEL_MISSED_APPOINTMENT_REASON =
  'Cancelled by salon — customer did not arrive for the scheduled appointment.';

const AUTO_CANCEL_STATUSES: BookingStatus[] = ['pending', 'confirmed'];

export function shouldAutoCancelMissedAppointment(
  booking: Pick<Booking, 'status' | 'date' | 'time_slot' | 'duration_minutes'>,
  now: Date = new Date(),
): boolean {
  if (!AUTO_CANCEL_STATUSES.includes(booking.status)) return false;
  return isAppointmentTimeReached(booking, now);
}
