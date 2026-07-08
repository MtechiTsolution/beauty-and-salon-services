import { catalogApi } from '@mit-salon/shared/api';
import type { Service } from '@mit-salon/shared/types';
import { useQuery } from '@tanstack/react-query';

/** Services ranked by popularity algorithm (bookings, reviews, super-admin pins). */
export function usePopularServices(limit = 12, enabled = true) {
  return useQuery({
    queryKey: ['popular-services', limit],
    queryFn: () => catalogApi.popularServices(limit),
    enabled,
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

export type { Service };
