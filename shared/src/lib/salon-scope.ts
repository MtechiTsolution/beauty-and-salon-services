import type { Booking, Branch, Employee, Package, Review, Service, ServiceCategory } from '../types';

export type SalonScopeParams = {
  branch_id?: string;
};

export function branchQuery(branchId?: string | null): string {
  if (!branchId?.trim()) return '';
  return `?branch_id=${encodeURIComponent(branchId.trim())}`;
}

function hasBranchId(value: unknown): value is { branch_id: string } {
  return typeof value === 'object' && value !== null && typeof (value as { branch_id?: string }).branch_id === 'string';
}

function hasBranchIds(value: unknown): value is { branch_ids: string[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { branch_ids?: string[] }).branch_ids)
  );
}

export function belongsToSalon(item: unknown, branchId: string): boolean {
  if (!branchId) return true;
  if (!item || typeof item !== 'object') return false;

  if (hasBranchId(item)) return item.branch_id === branchId;
  if (hasBranchIds(item)) return item.branch_ids.includes(branchId);
  if ('address' in item && 'id' in item) return String((item as Branch).id) === branchId;

  return true;
}

export function filterBySalon<T>(items: T[], branchId: string | null | undefined): T[] {
  if (!branchId) return items;
  return items.filter((item) => belongsToSalon(item, branchId));
}

export function filterEmployeesForSalon(employees: Employee[], branchId: string): Employee[] {
  return employees
    .filter((employee) => employee.branch_id === branchId)
    .map((employee) => ({
      ...employee,
      service_ids: employee.service_ids ?? [],
    }));
}

export function filterServicesForSalon(services: Service[], branchId: string): Service[] {
  return services
    .filter((service) => service.branch_ids?.includes(branchId))
    .map((service) => ({
      ...service,
      branch_ids: [branchId],
      employee_ids: service.employee_ids ?? [],
    }));
}

export function filterPackagesForSalon(packages: Package[], branchId: string): Package[] {
  return packages
    .filter((pkg) => pkg.branch_ids?.includes(branchId))
    .map((pkg) => ({
      ...pkg,
      branch_ids: [branchId],
      service_ids: pkg.service_ids ?? [],
    }));
}

export function filterCategoriesForSalon(categories: ServiceCategory[], branchId: string): ServiceCategory[] {
  return categories.filter((category) => !category.branch_id || category.branch_id === branchId);
}

export function filterBookingsForSalon(bookings: Booking[], branchId: string): Booking[] {
  return bookings.filter((booking) => String(booking.branch_id) === branchId);
}

export function filterReviewsForSalon(reviews: Review[], branchId: string): Review[] {
  return reviews.filter((review) => !review.branch_id || review.branch_id === branchId);
}

export function scopePayloadForSalon<T extends Record<string, unknown>>(
  data: T,
  branchId: string,
  kind: 'service' | 'package' | 'staff' | 'category',
): T {
  if (kind === 'service' || kind === 'package') {
    return { ...data, branch_ids: [branchId] };
  }
  if (kind === 'staff') {
    return { ...data, branch_id: branchId };
  }
  if (kind === 'category') {
    return { ...data, branch_id: branchId };
  }
  return data;
}
