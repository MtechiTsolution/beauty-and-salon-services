import { packagesApi } from '@mit-salon/shared/api';
import type { Package } from '@mit-salon/shared/types';
import { useQuery } from '@tanstack/react-query';

export function useActivePackages(enabled = true) {
  return useQuery({
    queryKey: ['packages'],
    queryFn: () => packagesApi.list(),
    enabled,
    refetchOnMount: 'always',
    staleTime: 0,
    select: (rows) => rows.filter((p) => p.status === 'active') as Package[],
  });
}
