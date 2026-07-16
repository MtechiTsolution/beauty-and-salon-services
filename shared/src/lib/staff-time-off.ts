import { bookingEndMinutes, intervalsOverlap, slotToMinutes } from './booking-slot-time';

export type StaffTimeOffBlock = {
  start_date: string;
  end_date: string;
  /** NULL = full day on each date in range */
  start_time?: string | null;
  end_time?: string | null;
};

const SALON_DAY_START = 9 * 60;
const SALON_DAY_END = 19 * 60 + 30;

function dateInRange(date: string, block: StaffTimeOffBlock): boolean {
  const d = date.slice(0, 10);
  return d >= block.start_date.slice(0, 10) && d <= block.end_date.slice(0, 10);
}

/** True when staff is fully off on this calendar day. */
export function isStaffFullDayOff(date: string, blocks: StaffTimeOffBlock[]): boolean {
  return blocks.some((block) => {
    if (!dateInRange(date, block)) return false;
    return !block.start_time?.trim() && !block.end_time?.trim();
  });
}

/** True when a new appointment would overlap staff time off. */
export function isSlotBlockedByTimeOff(
  date: string,
  slot: string,
  durationMinutes: number,
  blocks: StaffTimeOffBlock[],
): boolean {
  const day = date.slice(0, 10);
  const newStart = slotToMinutes(slot);
  const newEnd = bookingEndMinutes(slot, durationMinutes);

  return blocks.some((block) => {
    if (!dateInRange(day, block)) return false;

    const hasPartial = Boolean(block.start_time?.trim() && block.end_time?.trim());
    if (!hasPartial) {
      return true;
    }

    const offStart = slotToMinutes(block.start_time!);
    const offEnd = slotToMinutes(block.end_time!);
    return intervalsOverlap(newStart, newEnd, offStart, offEnd);
  });
}

/** Filter slot list for UI pickers. */
export function filterSlotsForTimeOff(
  date: string,
  slots: readonly string[],
  durationMinutes: number,
  blocks: StaffTimeOffBlock[],
): string[] {
  if (isStaffFullDayOff(date, blocks)) return [];
  return slots.filter((slot) => !isSlotBlockedByTimeOff(date, slot, durationMinutes, blocks));
}

export const STAFF_TIME_OFF_CONFLICT_MESSAGE =
  'This stylist is unavailable at the selected time (scheduled time off). Please choose another time or professional.';

export const STAFF_FULL_DAY_OFF_MESSAGE =
  'This stylist is not available on the selected date. Please choose another date or professional.';
