import type { BookingOfferingType } from '@/features/booking/components/BookingOfferingToggle';
import type { PaymentMethodId } from '@mit-salon/shared/lib/constants';

const DRAFT_PREFIX = 'mit-salon-booking-draft:';
const SESSION_DRAFT_KEY = `${DRAFT_PREFIX}__session__`;

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
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
};

export type BookingDraftScope =
  | { kind: 'account'; email: string }
  | { kind: 'guest'; email: string }
  | { kind: 'session' };

function storageKey(email: string) {
  return `${DRAFT_PREFIX}${email.toLowerCase()}`;
}

function isValidGuestEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getBookingDraftScope(input: {
  userEmail?: string | null;
  guestEmail?: string;
  isAuthenticated: boolean;
}): BookingDraftScope | null {
  if (input.userEmail?.trim()) {
    return { kind: 'account', email: input.userEmail.trim().toLowerCase() };
  }

  const guestEmail = input.guestEmail?.trim().toLowerCase() ?? '';
  if (!input.isAuthenticated && guestEmail && isValidGuestEmail(guestEmail)) {
    return { kind: 'guest', email: guestEmail };
  }

  if (!input.isAuthenticated) {
    return { kind: 'session' };
  }

  return null;
}

function parseDraft(raw: string | null): BookingDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BookingDraft;
    if (typeof parsed.step !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function loadBookingDraft(email: string): BookingDraft | null {
  try {
    return parseDraft(localStorage.getItem(storageKey(email)));
  } catch {
    return null;
  }
}

export function loadSessionBookingDraft(): BookingDraft | null {
  try {
    return parseDraft(sessionStorage.getItem(SESSION_DRAFT_KEY));
  } catch {
    return null;
  }
}

export function loadActiveBookingDraft(scope: BookingDraftScope | null): BookingDraft | null {
  if (!scope) return null;
  if (scope.kind === 'session') return loadSessionBookingDraft();
  return loadBookingDraft(scope.email);
}

export function saveBookingDraft(email: string, draft: BookingDraft): void {
  try {
    localStorage.setItem(storageKey(email), JSON.stringify(draft));
  } catch {
    /* storage full or disabled */
  }
}

export function saveSessionBookingDraft(draft: BookingDraft): void {
  try {
    sessionStorage.setItem(SESSION_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* storage full or disabled */
  }
}

export function saveActiveBookingDraft(scope: BookingDraftScope | null, draft: BookingDraft): void {
  if (!scope) return;
  if (scope.kind === 'session') {
    saveSessionBookingDraft(draft);
    return;
  }
  saveBookingDraft(scope.email, draft);
}

export function clearBookingDraft(email: string): void {
  try {
    localStorage.removeItem(storageKey(email));
  } catch {
    /* ignore */
  }
}

export function clearSessionBookingDraft(): void {
  try {
    sessionStorage.removeItem(SESSION_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function clearActiveBookingDraft(scope: BookingDraftScope | null): void {
  if (!scope) return;
  if (scope.kind === 'session') {
    clearSessionBookingDraft();
    return;
  }
  clearBookingDraft(scope.email);
}

export function clearAllBookingDrafts(input: {
  userEmail?: string | null;
  guestEmail?: string;
}): void {
  if (input.userEmail?.trim()) clearBookingDraft(input.userEmail.trim().toLowerCase());
  const guestEmail = input.guestEmail?.trim().toLowerCase() ?? '';
  if (guestEmail) clearBookingDraft(guestEmail);
  clearSessionBookingDraft();
}

export function hasBookingDraft(email: string): boolean {
  return loadBookingDraft(email) != null;
}

export function hasSessionBookingDraft(): boolean {
  return loadSessionBookingDraft() != null;
}

/** Move a browser-session draft onto a guest email key once contact details are entered. */
export function migrateSessionBookingDraftToGuestEmail(guestEmail: string): void {
  const email = guestEmail.trim().toLowerCase();
  if (!isValidGuestEmail(email)) return;

  const sessionDraft = loadSessionBookingDraft();
  if (!sessionDraft) return;

  saveBookingDraft(email, {
    ...sessionDraft,
    guestEmail: sessionDraft.guestEmail ?? email,
  });
  clearSessionBookingDraft();
}
