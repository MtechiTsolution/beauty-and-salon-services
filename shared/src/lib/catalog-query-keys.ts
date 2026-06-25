import type { QueryClient } from '@tanstack/react-query';

export const catalogQueryKeys = {
  branches: [
    'admin-branches',
    'admin-branches-dash',
    'admin-salon-picker-branches',
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
  notifications: ['admin-notifications', 'customer-notifications'],
  reviews: ['admin-reviews', 'reviews', 'my-reviews'],
  chats: ['admin-chats', 'customer-chats', 'chat-messages', 'chat-by-booking'],
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
      queryClient.invalidateQueries({ queryKey: [key], refetchType: 'all' }),
    ),
  );
}

/** Salon picker, super-admin lists, and other admin/platform queries not in catalog keys. */
export async function invalidatePlatformAppQueries(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    predicate: (query) => {
      const root = query.queryKey[0];
      return (
        typeof root === 'string' &&
        (root.startsWith('admin-') || root.startsWith('super-admin-'))
      );
    },
    refetchType: 'all',
  });
}

export async function refetchActivePlatformAppQueries(queryClient: QueryClient) {
  await queryClient.refetchQueries({
    predicate: (query) => {
      const root = query.queryKey[0];
      return (
        typeof root === 'string' &&
        (root.startsWith('admin-') || root.startsWith('super-admin-'))
      );
    },
    type: 'active',
  });
}

/** Force an immediate refetch of mounted catalog queries (used after live sync events). */
export async function refetchActiveCatalogQueries(queryClient: QueryClient) {
  await Promise.all(
    allLiveSyncQueryKeys.map((key) =>
      queryClient.refetchQueries({ queryKey: [key], type: 'active' }),
    ),
  );
}

const chatQueryKeyPrefixes = catalogQueryKeys.chats;

/** Refetch chat lists and optionally a single thread after SSE chat events. */
export async function refetchChatQueries(queryClient: QueryClient, chatId?: string) {
  await Promise.all(
    chatQueryKeyPrefixes.map((key) =>
      queryClient.refetchQueries({ queryKey: [key], type: 'active' }),
    ),
  );
  if (chatId) {
    await queryClient.refetchQueries({ queryKey: ['chat-messages', chatId], type: 'active' });
  }
}
