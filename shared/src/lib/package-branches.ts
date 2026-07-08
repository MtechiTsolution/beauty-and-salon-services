import type { Branch, Package, Service } from '../types';
import { sortBranchesByLocation } from './branch-location-sort';

const activeBranchesList = (branches: Branch[]) => branches.filter((b) => b.status === 'active');

/**
 * Salons where a service can be booked (admin `service.branch_ids`).
 */
export function getBranchesForService(service: Service, branches: Branch[]): Branch[] {
  const activeBranches = activeBranchesList(branches);
  const assignedIds = (service.branch_ids ?? []).filter(Boolean);
  if (!assignedIds.length) return [];
  return sortBranchesByLocation(activeBranches.filter((b) => assignedIds.includes(b.id)));
}

/**
 * Salons where a package can be booked.
 * Uses admin `package.branch_ids` (package_branches) as the source of truth.
 */
export function getBranchesForPackage(
  pkg: Package,
  branches: Branch[],
  _services: Service[] = [],
): Branch[] {
  const activeBranches = branches.filter((b) => b.status === 'active');
  const assignedIds = (pkg.branch_ids ?? []).filter(Boolean);
  if (!assignedIds.length) return [];
  return sortBranchesByLocation(activeBranches.filter((b) => assignedIds.includes(b.id)));
}

export function isPackageAvailableAtBranch(
  pkg: Package,
  branchId: string,
  branches: Branch[],
  services: Service[] = [],
): boolean {
  return getBranchesForPackage(pkg, branches, services).some((b) => b.id === branchId);
}

export function packageAvailableBranchCount(
  pkg: Package,
  branches: Branch[],
  _services: Service[] = [],
): number {
  return getBranchesForPackage(pkg, branches).length;
}

const activeBranchIdSet = (branches: Branch[]) =>
  new Set(activeBranchesList(branches).map((b) => b.id));

/**
 * Active salons that have at least one linked service or package available to book.
 */
export function getBookableBranches(
  branches: Branch[],
  services: Service[],
  packages: Package[],
): Branch[] {
  const activeBranches = activeBranchesList(branches);
  const activeIds = activeBranchIdSet(branches);
  const bookableIds = new Set<string>();

  for (const service of services) {
    if (service.status !== 'active') continue;
    for (const id of service.branch_ids ?? []) {
      if (activeIds.has(id)) bookableIds.add(id);
    }
  }

  for (const pkg of packages) {
    if (pkg.status !== 'active') continue;
    for (const id of pkg.branch_ids ?? []) {
      if (activeIds.has(id)) bookableIds.add(id);
    }
  }

  return sortBranchesByLocation(activeBranches.filter((b) => bookableIds.has(b.id)));
}

/** Service is customer-bookable only when linked to at least one active salon. */
export function isServiceAvailableAtAnyBranch(service: Service, branches: Branch[]): boolean {
  if (service.status !== 'active') return false;
  const activeIds = activeBranchIdSet(branches);
  return (service.branch_ids ?? []).some((id) => activeIds.has(id));
}

/** Package is customer-bookable only when explicitly linked to at least one active salon. */
export function isPackageAvailableAtAnyBranch(pkg: Package, branches: Branch[]): boolean {
  if (pkg.status !== 'active') return false;
  return packageAvailableBranchCount(pkg, branches) > 0;
}
