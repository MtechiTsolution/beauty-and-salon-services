import type { Branch, Package, Service } from '@mit-salon/shared/types';

export function normalizeBookingSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesBookingSearch(query: string, ...parts: (string | null | undefined)[]): boolean {
  const q = normalizeBookingSearchQuery(query);
  if (!q) return true;
  const haystack = parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export function filterBranchesForBookingSearch(branches: Branch[], query: string): Branch[] {
  const q = normalizeBookingSearchQuery(query);
  if (!q) return branches;
  return branches.filter((b) =>
    matchesBookingSearch(q, b.name, b.address, b.city, b.description),
  );
}

export function filterServicesForBookingSearch(services: Service[], query: string): Service[] {
  const q = normalizeBookingSearchQuery(query);
  if (!q) return services;
  return services.filter((s) => matchesBookingSearch(q, s.title, s.description));
}

export function filterPackagesForBookingSearch(packages: Package[], query: string): Package[] {
  const q = normalizeBookingSearchQuery(query);
  if (!q) return packages;
  return packages.filter((p) => matchesBookingSearch(q, p.name, p.description));
}
