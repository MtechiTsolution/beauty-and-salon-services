import type { Branch } from '@mit-salon/shared/types';

export function formatSalonHours(opening?: string | null, closing?: string | null): string | null {
  const open = opening?.trim();
  const close = closing?.trim();
  if (!open && !close) return null;
  if (open && close) return `${open} – ${close}`;
  return open || close || null;
}

function parseTimeToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

/** Whether the salon is within today's opening hours (local device time). */
export function getSalonOpenStatus(
  opening?: string | null,
  closing?: string | null,
): 'open' | 'closed' | null {
  const openMin = opening ? parseTimeToMinutes(opening) : null;
  const closeMin = closing ? parseTimeToMinutes(closing) : null;
  if (openMin == null || closeMin == null) return null;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  if (closeMin > openMin) {
    return nowMin >= openMin && nowMin < closeMin ? 'open' : 'closed';
  }

  return nowMin >= openMin || nowMin < closeMin ? 'open' : 'closed';
}

export function personInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function salonProfilePath(branchId: string): string {
  return `/salons/${encodeURIComponent(branchId)}`;
}

export function isSalonVisibleToCustomer(branch: Pick<Branch, 'status'>): boolean {
  return branch.status === 'active';
}
