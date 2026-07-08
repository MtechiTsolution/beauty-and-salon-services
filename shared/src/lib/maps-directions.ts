import type { Branch } from '../types';
import type { GeoCoordinates } from './branch-distance';
import { hasBranchCoordinates } from './branch-distance';

export type BranchDirectionsInput = Pick<
  Branch,
  'latitude' | 'longitude' | 'name' | 'address' | 'city'
>;

/** Destination query for Google Maps directions (coordinates preferred). */
export function branchToDirectionsQuery(branch: BranchDirectionsInput): string | null {
  if (hasBranchCoordinates(branch)) {
    return `${branch.latitude},${branch.longitude}`;
  }

  const address = [branch.address, branch.city].filter(Boolean).join(', ').trim();
  return address || null;
}

export function canOpenBranchDirections(branch: BranchDirectionsInput): boolean {
  return branchToDirectionsQuery(branch) != null;
}

/** Opens Google Maps driving directions in a new tab. */
export function buildBranchDirectionsUrl(
  branch: BranchDirectionsInput,
  origin?: GeoCoordinates | null,
): string | null {
  const destination = branchToDirectionsQuery(branch);
  if (!destination) return null;

  const params = new URLSearchParams({
    api: '1',
    destination,
    travelmode: 'driving',
  });

  if (origin?.latitude != null && origin?.longitude != null) {
    params.set('origin', `${origin.latitude},${origin.longitude}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function openBranchDirections(
  branch: BranchDirectionsInput,
  origin?: GeoCoordinates | null,
): boolean {
  const url = buildBranchDirectionsUrl(branch, origin);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
