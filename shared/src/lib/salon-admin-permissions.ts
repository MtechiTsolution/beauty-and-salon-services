export const SALON_ADMIN_PERMISSIONS = [
  'dashboard.read',
  'branches.read',
  'branches.write',
  'categories.read',
  'categories.write',
  'services.read',
  'services.write',
  'staff.read',
  'staff.write',
  'bookings.read',
  'bookings.write',
  'reviews.read',
  'reviews.write',
  'chats.read',
  'chats.write',
  'customers.read',
  'customers.write',
  'coupons.read',
  'coupons.write',
  'packages.read',
  'packages.write',
  'reports.read',
  'announcements.read',
  'announcements.write',
  'notifications.read',
  'team.read',
  'team.manage',
] as const;

export type SalonAdminPermission = (typeof SALON_ADMIN_PERMISSIONS)[number];

export type SalonAdminRoleKey = 'owner' | 'manager' | 'receptionist';

export const SALON_ADMIN_ROLE_LABELS: Record<SalonAdminRoleKey, string> = {
  owner: 'Owner',
  manager: 'Manager',
  receptionist: 'Receptionist',
};

/** Permissions granted to each non-owner role. Owners receive all permissions implicitly. */
export const SALON_ADMIN_ROLE_PERMISSIONS: Record<
  Exclude<SalonAdminRoleKey, 'owner'>,
  readonly SalonAdminPermission[]
> = {
  manager: [
    'dashboard.read',
    'branches.read',
    'categories.read',
    'categories.write',
    'services.read',
    'services.write',
    'staff.read',
    'staff.write',
    'bookings.read',
    'bookings.write',
    'reviews.read',
    'reviews.write',
    'chats.read',
    'chats.write',
    'customers.read',
    'packages.read',
    'reports.read',
    'announcements.read',
    'notifications.read',
  ],
  receptionist: [
    'dashboard.read',
    'bookings.read',
    'bookings.write',
    'reviews.read',
    'chats.read',
    'chats.write',
    'customers.read',
    'notifications.read',
  ],
};

export const ADMIN_NAV_PERMISSIONS: Record<string, SalonAdminPermission> = {
  '/': 'dashboard.read',
  '/branches': 'branches.read',
  '/categories': 'categories.read',
  '/services': 'services.read',
  '/staff': 'staff.read',
  '/bookings': 'bookings.read',
  '/reviews': 'reviews.read',
  '/chats': 'chats.read',
  '/customers': 'customers.read',
  '/coupons': 'coupons.read',
  '/packages': 'packages.read',
  '/reports': 'reports.read',
  '/announcements': 'announcements.read',
  '/notifications': 'notifications.read',
  '/team': 'team.read',
};

export function roleHasPermission(
  roleKey: SalonAdminRoleKey | 'owner',
  permission: SalonAdminPermission,
): boolean {
  if (roleKey === 'owner') return true;
  return SALON_ADMIN_ROLE_PERMISSIONS[roleKey].includes(permission);
}
