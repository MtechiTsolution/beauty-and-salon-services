import { useCustomerLocation } from '@/features/location/context/CustomerLocationContext';
import {
  nearestBranch,
  sortBranchesByProximity,
  type BranchWithDistance,
} from '@mit-salon/shared/lib/branch-distance';
import type { Branch } from '@mit-salon/shared/types';
import { useMemo } from 'react';

type UseNearbyBranchesOptions = {
  /** When set, salons farther than this are hidden (requires user location). */
  maxDistanceKm?: number | null;
};

export function useNearbyBranches(
  branches: Branch[],
  options: UseNearbyBranchesOptions = {},
): {
  branches: BranchWithDistance[];
  nearest: BranchWithDistance | null;
  hasLocation: boolean;
  isLocating: boolean;
} {
  const { coords, status } = useCustomerLocation();
  const { maxDistanceKm = null } = options;

  const sorted = useMemo(
    () => sortBranchesByProximity(branches, coords, maxDistanceKm),
    [branches, coords, maxDistanceKm],
  );

  return {
    branches: sorted,
    nearest: nearestBranch(sorted),
    hasLocation: coords != null,
    isLocating: status === 'loading',
  };
}
