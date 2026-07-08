export type BookingDateRange = {
  from?: string;
  to?: string;
};

export type BookingDateQuickPreset = 'today' | 'weekly' | 'monthly' | 'three_months';

export type BookingDateFilterPreset = BookingDateQuickPreset | 'custom' | 'all';

export const BOOKING_DATE_PRESET_OPTIONS: { id: BookingDateFilterPreset; label: string }[] = [
  { id: 'all', label: 'All dates' },
  { id: 'today', label: "Today's appointments" },
  { id: 'weekly', label: 'This week' },
  { id: 'monthly', label: 'This month' },
  { id: 'three_months', label: 'Last 3 months' },
  { id: 'custom', label: 'Custom' },
];

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Calendar date of the scheduled visit (YYYY-MM-DD). Never uses created_at. */
export function normalizeBookingDate(value: unknown): string {
  if (value == null || value === '') return '';
  if (value instanceof Date) {
    return formatLocalDate(value);
  }
  const s = String(value).trim();
  const dateOnly = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnly) return dateOnly[1];
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    return formatLocalDate(parsed);
  }
  return s.slice(0, 10);
}

/** Appointment date for filtering/display — prefers `date`, falls back to `booking_date`. */
export function getBookingAppointmentDate(booking: {
  date?: string;
  booking_date?: string;
}): string {
  return normalizeBookingDate(booking.date ?? booking.booking_date);
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Monday as the first day of the week. */
function startOfLocalWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const result = new Date(d);
  result.setDate(d.getDate() + diff);
  return startOfLocalDay(result);
}

function endOfLocalWeek(d: Date): Date {
  const start = startOfLocalWeek(d);
  const result = new Date(start);
  result.setDate(start.getDate() + 6);
  return result;
}

function startOfLocalMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfLocalMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function subLocalMonths(d: Date, months: number): Date {
  const result = new Date(d);
  result.setMonth(result.getMonth() - months);
  return result;
}

export function getBookingDateQuickPresetRange(
  preset: BookingDateQuickPreset,
  now: Date = new Date(),
): BookingDateRange {
  const today = startOfLocalDay(now);

  switch (preset) {
    case 'today':
      return { from: formatLocalDate(today), to: formatLocalDate(today) };
    case 'weekly':
      return {
        from: formatLocalDate(startOfLocalWeek(today)),
        to: formatLocalDate(endOfLocalWeek(today)),
      };
    case 'monthly':
      return {
        from: formatLocalDate(startOfLocalMonth(today)),
        to: formatLocalDate(endOfLocalMonth(today)),
      };
    case 'three_months':
      return {
        from: formatLocalDate(startOfLocalMonth(subLocalMonths(today, 2))),
        to: formatLocalDate(endOfLocalMonth(today)),
      };
  }
}

export function detectBookingDateQuickPreset(
  range: BookingDateRange,
  now: Date = new Date(),
): BookingDateQuickPreset | 'custom' | null {
  if (!hasActiveBookingDateRange(range)) return null;

  const presets: BookingDateQuickPreset[] = ['today', 'weekly', 'monthly', 'three_months'];
  for (const preset of presets) {
    const presetRange = getBookingDateQuickPresetRange(preset, now);
    if (presetRange.from === range.from && presetRange.to === range.to) {
      return preset;
    }
  }

  return 'custom';
}

export function isBookingDateInRange(date: string, range: BookingDateRange): boolean {
  const { from, to } = range;
  if (!from && !to) return true;
  const d = normalizeBookingDate(date);
  if (!d) return false;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

export function isBookingDateRangeValid(from: string, to: string): boolean {
  if (!from || !to) return true;
  return from <= to;
}

export function filterBookingsByDateRange<T extends { date?: string; booking_date?: string }>(
  bookings: T[],
  range: BookingDateRange,
): T[] {
  if (!range.from && !range.to) return bookings;
  return bookings.filter((b) => isBookingDateInRange(getBookingAppointmentDate(b), range));
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
