import type { Branch } from '../types';

export type GeoCoordinates = {
  latitude: number;
  longitude: number;
};

export type BranchWithDistance = Branch & {
  distance_km?: number | null;
};

const EARTH_RADIUS_KM = 6371;

export function parseCoordinate(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

export function normalizeBranchCoordinates<T extends Branch>(branch: T): T {
  const latitude = parseCoordinate(branch.latitude) ?? undefined;
  const longitude = parseCoordinate(branch.longitude) ?? undefined;
  const distance_km = parseCoordinate(branch.distance_km) ?? branch.distance_km ?? undefined;
  return {
    ...branch,
    latitude,
    longitude,
    distance_km: distance_km as number | null | undefined,
  };
}

export function hasBranchCoordinates(
  branch: Pick<Branch, 'latitude' | 'longitude'>,
): branch is Branch & { latitude: number; longitude: number } {
  const lat = parseCoordinate(branch.latitude);
  const lng = parseCoordinate(branch.longitude);
  return lat != null && lng != null;
}

/** Great-circle distance in kilometres (Haversine). */
export function haversineDistanceKm(a: GeoCoordinates, b: GeoCoordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km) || km < 0) return '';
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

function compareByCityAddressName(a: Branch, b: Branch): number {
  const cityA = (a.city ?? '').trim().toLowerCase();
  const cityB = (b.city ?? '').trim().toLowerCase();
  if (cityA !== cityB) {
    if (!cityA) return 1;
    if (!cityB) return -1;
    return cityA.localeCompare(cityB);
  }
  const addrA = (a.address ?? '').trim().toLowerCase();
  const addrB = (b.address ?? '').trim().toLowerCase();
  if (addrA !== addrB) return addrA.localeCompare(addrB);
  return a.name.localeCompare(b.name);
}

function branchDistanceKm(branch: Branch, user: GeoCoordinates): number | null {
  const preset = parseCoordinate(branch.distance_km);
  if (preset != null) return preset;
  if (!hasBranchCoordinates(branch)) return null;
  return haversineDistanceKm(user, {
    latitude: branch.latitude!,
    longitude: branch.longitude!,
  });
}

/** Sort salons nearest-first when user coordinates are available. */
export function sortBranchesByProximity(
  branches: Branch[],
  user: GeoCoordinates | null | undefined,
  maxDistanceKm?: number | null,
): BranchWithDistance[] {
  const enriched: BranchWithDistance[] = branches.map((branch) => {
    const normalized = normalizeBranchCoordinates(branch);
    if (!user) return { ...normalized, distance_km: null };
    const distance_km = branchDistanceKm(normalized, user);
    return { ...normalized, distance_km };
  });

  const filtered =
    user && maxDistanceKm != null && maxDistanceKm > 0
      ? enriched.filter((b) => b.distance_km == null || b.distance_km <= maxDistanceKm)
      : enriched;

  return [...filtered].sort((a, b) => {
    const aDist = a.distance_km;
    const bDist = b.distance_km;
    if (aDist != null && bDist != null) {
      const diff = aDist - bDist;
      if (diff !== 0) return diff;
    } else if (aDist != null) {
      return -1;
    } else if (bDist != null) {
      return 1;
    }
    return compareByCityAddressName(a, b);
  });
}

export function nearestBranch(
  branches: BranchWithDistance[],
): BranchWithDistance | null {
  return branches.find((b) => b.distance_km != null) ?? branches[0] ?? null;
}
