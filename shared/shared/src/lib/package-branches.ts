import type { Branch, Package, Service } from '../types';

/**
 * Salons where a package can be booked.
 * Uses admin `package.branch_ids` (package_branches) as the source of truth.
 * When no branches are assigned on the package, falls back to salons that offer every included service.
 */
export function getBranchesForPackage(
  pkg: Package,
  branches: Branch[],
  services: Service[] = [],
): Branch[] {
  const activeBranches = branches.filter((b) => b.status === 'active');
  const assignedIds = (pkg.branch_ids ?? []).filter(Boolean);

  if (assignedIds.length > 0) {
    return activeBranches.filter((b) => assignedIds.includes(b.id));
  }

  const packageServices = (pkg.service_ids ?? [])
    .map((id) => services.find((s) => s.id === id))
    .filter((s): s is Service => !!s && s.status === 'active');

  if (!packageServices.length) return [];

  return activeBranches.filter((branch) =>
    packageServices.every((s) => s.branch_ids.includes(branch.id)),
  );
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
  services: Service[] = [],
): number {
  return getBranchesForPackage(pkg, branches, services).length;
}
