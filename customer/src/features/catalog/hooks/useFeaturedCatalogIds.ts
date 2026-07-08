import { catalogApi } from '@mit-salon/shared/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export function useFeaturedCatalogIds(enabled = true) {
  const query = useQuery({
    queryKey: ['catalog-featured-ids'],
    queryFn: () => catalogApi.featuredIds(),
    enabled,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const serviceIdSet = useMemo(
    () => new Set(query.data?.service_ids ?? []),
    [query.data?.service_ids],
  );
  const packageIdSet = useMemo(
    () => new Set(query.data?.package_ids ?? []),
    [query.data?.package_ids],
  );

  const branchIdSet = useMemo(
    () => new Set(query.data?.branch_ids ?? []),
    [query.data?.branch_ids],
  );

  return {
    ...query,
    serviceIdSet,
    packageIdSet,
    branchIdSet,
    isFeaturedService: (id: string) => serviceIdSet.has(id),
    isFeaturedPackage: (id: string) => packageIdSet.has(id),
    isFeaturedBranch: (id: string) => branchIdSet.has(id),
  };
}
