import {
  isPackageAvailableAtAnyBranch,
  isServiceAvailableAtAnyBranch,
} from './package-branches';
import type { Branch, Package, Service } from '../types';

/** Customer-facing services must be active and linked to at least one active salon. */
export function filterCustomerServices(services: Service[], branches: Branch[]): Service[] {
  return services.filter((service) => isServiceAvailableAtAnyBranch(service, branches));
}

/** Customer-facing packages must be active and explicitly assigned to at least one active salon. */
export function filterCustomerPackages(packages: Package[], branches: Branch[]): Package[] {
  return packages.filter((pkg) => isPackageAvailableAtAnyBranch(pkg, branches));
}
