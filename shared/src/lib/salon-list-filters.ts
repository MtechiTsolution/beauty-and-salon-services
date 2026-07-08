import type { BranchWithDistance } from './branch-distance';
import type { BranchReviewStats } from './salon-review-stats';

export const SALON_DISTANCE_PRESET_KM = [1, 5, 10] as const;

export type SalonDistancePresetKm = (typeof SALON_DISTANCE_PRESET_KM)[number];
export type SalonDistanceFilterValue = 'all' | SalonDistancePresetKm | 'custom';

export type SalonSortOption = 'distance' | 'rating' | 'name';

export type SalonListFilters = {
  distance: SalonDistanceFilterValue;
  customDistanceKm: string;
  minRating: number | null;
  sortBy: SalonSortOption;
};

export const DEFAULT_SALON_LIST_FILTERS: SalonListFilters = {
  distance: 'all',
  customDistanceKm: '',
  minRating: null,
  sortBy: 'distance',
};

export const SALON_MIN_RATING_OPTIONS = [
  { value: null, label: 'Any rating' },
  { value: 4, label: '4★ & up' },
  { value: 3, label: '3★ & up' },
  { value: 2, label: '2★ & up' },
  { value: 1, label: '1★ & up' },
] as const;

function compareByName(a: BranchWithDistance, b: BranchWithDistance): number {
  const cityA = (a.city ?? '').trim().toLowerCase();
  const cityB = (b.city ?? '').trim().toLowerCase();
  if (cityA !== cityB) {
    if (!cityA) return 1;
    if (!cityB) return -1;
    return cityA.localeCompare(cityB);
  }
  return a.name.localeCompare(b.name);
}

export function resolveMaxDistanceKm(filters: SalonListFilters): number | null {
  if (filters.distance === 'all') return null;
  if (filters.distance === 'custom') {
    const parsed = Number.parseFloat(filters.customDistanceKm.trim());
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  return filters.distance;
}

export function hasActiveSalonFilters(filters: SalonListFilters): boolean {
  return (
    filters.distance !== 'all' ||
    filters.minRating != null ||
    filters.sortBy !== 'distance'
  );
}

export function filterSalonsForList(
  salons: BranchWithDistance[],
  filters: SalonListFilters,
  reviewStats: Map<string, BranchReviewStats>,
  options: { hasLocation: boolean },
): BranchWithDistance[] {
  const maxKm = resolveMaxDistanceKm(filters);
  let list = salons.filter((salon) => {
    if (maxKm != null) {
      if (!options.hasLocation) return true;
      if (salon.distance_km == null) return false;
      if (salon.distance_km > maxKm) return false;
    }

    if (filters.minRating != null) {
      const stats = reviewStats.get(salon.id);
      if (!stats || stats.reviewCount <= 0 || stats.averageRating < filters.minRating) {
        return false;
      }
    }

    return true;
  });

  list = [...list].sort((a, b) => {
    if (filters.sortBy === 'rating') {
      const aStats = reviewStats.get(a.id);
      const bStats = reviewStats.get(b.id);
      const aRating = aStats?.averageRating ?? -1;
      const bRating = bStats?.averageRating ?? -1;
      if (bRating !== aRating) return bRating - aRating;
      const countDiff = (bStats?.reviewCount ?? 0) - (aStats?.reviewCount ?? 0);
      if (countDiff !== 0) return countDiff;
      return compareByName(a, b);
    }

    if (filters.sortBy === 'distance' && options.hasLocation) {
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
      return compareByName(a, b);
    }

    return compareByName(a, b);
  });

  return list;
}
