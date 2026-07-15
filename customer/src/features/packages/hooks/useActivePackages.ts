import { useCustomerBranches } from '@/features/location/hooks/useCustomerBranches';
import { packagesApi } from '@mit-salon/shared/api';
import { filterCustomerPackages } from '@mit-salon/shared/lib/customer-catalog';
import type { Package } from '@mit-salon/shared/types';
import { useQuery } from '@tanstack/react-query';

export function useActivePackages(
  enabled = true,
  options?: { refetchInterval?: number | false; staleTime?: number },
) {
  const { data: branches = [] } = useCustomerBranches({
    queryKeyPrefix: 'branches-catalog',
    enabled,
    staleTime: options?.staleTime ?? 60_000,
    refetchInterval: options?.refetchInterval,
  });

  return useQuery({
    queryKey: ['packages', branches.map((b) => b.id).join(',')],
    queryFn: () => packagesApi.list(),
    enabled,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: options?.staleTime ?? 0,
    refetchInterval: options?.refetchInterval,
    select: (rows) =>
      filterCustomerPackages(
        rows.filter((p) => p.status === 'active') as Package[],
        branches,
      ),
  });
}
