import { reviewsApi } from '@mit-salon/shared/api';
import { buildBranchReviewStats } from '@mit-salon/shared/lib/salon-review-stats';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export function useSalonReviewStats(enabled = true) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['salon-review-stats'],
    queryFn: () => reviewsApi.list(),
    enabled,
    staleTime: 60_000,
  });

  const statsByBranchId = useMemo(() => buildBranchReviewStats(reviews), [reviews]);

  return { statsByBranchId, isLoading };
}
