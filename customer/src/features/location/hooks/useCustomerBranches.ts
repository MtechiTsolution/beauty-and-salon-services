import { useCustomerLocation } from '@/features/location/context/CustomerLocationContext';
import { branchesApi } from '@mit-salon/shared/api';
import type { Branch } from '@mit-salon/shared/types';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type UseCustomerBranchesOptions = Omit<
  UseQueryOptions<Branch[], Error, Branch[], (string | number | null)[]>,
  'queryKey' | 'queryFn'
> & {
  queryKeyPrefix?: string;
};

export function useCustomerBranches(options: UseCustomerBranchesOptions = {}) {
  const { queryKeyPrefix = 'branches', ...queryOptions } = options;
  const { coords } = useCustomerLocation();

  return useQuery({
    queryKey: [queryKeyPrefix, coords?.latitude ?? null, coords?.longitude ?? null],
    queryFn: () =>
      branchesApi.list(
        coords
          ? { latitude: coords.latitude, longitude: coords.longitude }
          : undefined,
      ),
    refetchOnMount: 'always',
    ...queryOptions,
  });
}

export function customerBranchesQueryKey(
  prefix = 'branches',
  coords?: { latitude: number; longitude: number } | null,
) {
  return [prefix, coords?.latitude ?? null, coords?.longitude ?? null] as const;
}
