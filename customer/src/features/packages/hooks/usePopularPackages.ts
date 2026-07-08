import { catalogApi } from '@mit-salon/shared/api';
import type { Package } from '@mit-salon/shared/types';
import { useQuery } from '@tanstack/react-query';

/** Packages ranked by popularity algorithm (bookings + super-admin pins). */
export function usePopularPackages(limit = 50, enabled = true) {
  return useQuery({
    queryKey: ['popular-packages', limit],
    queryFn: () => catalogApi.popularPackages(limit),
    enabled,
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

export type { Package };
