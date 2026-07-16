/** Pure clock helpers used by both booking slots and staff time-off (avoids require cycles). */

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

export function intervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && endA > startB;
}
