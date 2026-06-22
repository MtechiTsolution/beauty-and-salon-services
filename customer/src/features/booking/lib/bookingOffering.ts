export { packageDurationMinutes } from '@mit-salon/shared/lib/package-duration';
import type { Package, Service } from '@mit-salon/shared/types';

export function packagePrimaryServiceId(pkg: Package): string | undefined {
  return pkg.service_ids[0];
}

export function bookingLineTitle(service: Service | null, pkg: Package | null): string {
  if (service) return service.title;
  if (pkg) return `Package: ${pkg.name}`;
  return '';
}
