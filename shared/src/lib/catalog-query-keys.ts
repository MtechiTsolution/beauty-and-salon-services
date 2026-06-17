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
