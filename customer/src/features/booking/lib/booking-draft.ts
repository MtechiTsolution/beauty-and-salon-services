import type { BookingOfferingType } from '@/features/booking/components/BookingOfferingToggle';
import type { PaymentMethodId } from '@mit-salon/shared/lib/constants';

const DRAFT_PREFIX = 'mit-salon-booking-draft:';

export type BookingDraft = {
  step: number;
  branchId: string | null;
  offeringType: BookingOfferingType;
  serviceId: string | null;
  packageId: string | null;
  employeeId: string | null;
  date: string;
  time: string;
  paymentMethod: PaymentMethodId | null;
  couponCode: string;
  discount: number;
  notes: string;
  savedAt: string;
};

function storageKey(email: string) {
  return `${DRAFT_PREFIX}${email.toLowerCase()}`;
}

export function loadBookingDraft(email: string): BookingDraft | null {
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookingDraft;
    if (typeof parsed.step !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveBookingDraft(email: string, draft: BookingDraft): void {
  try {
    localStorage.setItem(storageKey(email), JSON.stringify(draft));
  } catch {
    /* storage full or disabled */
  }
}

export function clearBookingDraft(email: string): void {
  try {
    localStorage.removeItem(storageKey(email));
  } catch {
    /* ignore */
  }
}

export function hasBookingDraft(email: string): boolean {
  return loadBookingDraft(email) != null;
}
