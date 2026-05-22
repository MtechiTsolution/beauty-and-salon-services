import type { QueryClient } from '@tanstack/react-query';

export const catalogQueryKeys = {
  branches: [
    'admin-branches',
    'admin-branches-dash',
    'lookup-branches',
    'branches',
    'branches-book',
    'branches-explore',
    'branches-welcome',
    'branches-home',
  ],
  categories: ['admin-categories', 'lookup-categories', 'categories'],
  services: [
    'admin-services',
    'lookup-services',
    'services',
    'services-book',
    'services-explore',
    'services-home',
  ],
  staff: ['admin-staff', 'lookup-staff', 'employees-book'],
  packages: ['admin-packages', 'packages', 'packages-welcome', 'packages-explore'],
  coupons: ['admin-coupons'],
  payouts: ['admin-payouts'],
  bookings: ['admin-bookings-list', 'admin-bookings', 'bookings', 'bookings-slot', 'reports-summary'],
  notifications: ['admin-notifications'],
  reviews: ['admin-reviews', 'reviews', 'my-reviews'],
} as const;

export type CatalogEntity = keyof typeof catalogQueryKeys;

export const allLiveSyncQueryKeys = [
  ...new Set([
    ...Object.values(catalogQueryKeys).flat(),
    'admin-customers',
    'my-bookings',
    'my-reviews',
    'admin-reviews',
    'reviews',
  ]),
] as const;

export async function invalidateAllCatalogQueries(queryClient: QueryClient) {
  await Promise.all(
    allLiveSyncQueryKeys.map((key) =>
      queryClient.invalidateQueries({ queryKey: [key], refetchType: 'active' }),
    ),
  );
}
