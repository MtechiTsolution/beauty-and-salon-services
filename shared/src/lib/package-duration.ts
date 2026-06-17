import type { Package, Service } from '../types';

const DEFAULT_PACKAGE_DURATION_MINUTES = 60;

/**
 * Total visit time for a package: sum of all included service durations.
 * A package with two 60-minute services blocks 120 minutes on the calendar.
 */
export function packageDurationMinutes(pkg: Package, services: Service[]): number {
  const durations = pkg.service_ids
    .map((id) => services.find((s) => s.id === id)?.duration_minutes)
    .filter((d): d is number => typeof d === 'number' && d > 0);

  if (!durations.length) return DEFAULT_PACKAGE_DURATION_MINUTES;
  return durations.reduce((sum, d) => sum + d, 0);
}
