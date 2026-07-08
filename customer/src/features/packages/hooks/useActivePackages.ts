import { useCustomerBranches } from '@/features/location/hooks/useCustomerBranches';
import { packagesApi } from '@mit-salon/shared/api';
import { filterCustomerPackages } from '@mit-salon/shared/lib/customer-catalog';
import type { Package } from '@mit-salon/shared/types';
import { useQuery } from '@tanstack/react-query';

export function useActivePackages(enabled = true) {
  const { data: branches = [] } = useCustomerBranches({
    queryKeyPrefix: 'branches-catalog',
    enabled,
    staleTime: 60_000,
  });

  return useQuery({
    queryKey: ['packages', branches.map((b) => b.id).join(',')],
    queryFn: () => packagesApi.list(),
    enabled,
    refetchOnMount: 'always',
    staleTime: 0,
    select: (rows) =>
      filterCustomerPackages(
        rows.filter((p) => p.status === 'active') as Package[],
        branches,
      ),
  });
}
