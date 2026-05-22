/** Keep in sync with packages/shared/src/lib/staff-roles.ts */
export const VALID_STAFF_ROLES = [
  'manager',
  'receptionist',
  'stylist',
  'threading_trimming',
  'hairdresser',
  'massage_expert',
] as const;

export type ValidStaffRole = (typeof VALID_STAFF_ROLES)[number];

const BOOKABLE = new Set<ValidStaffRole>([
  'stylist',
  'threading_trimming',
  'hairdresser',
  'massage_expert',
]);

export function isValidStaffRole(role: unknown): role is ValidStaffRole {
  return typeof role === 'string' && (VALID_STAFF_ROLES as readonly string[]).includes(role);
}

export function isBookableStaffRole(role: string): boolean {
  return BOOKABLE.has(role as ValidStaffRole);
}

export function validateStaffPayload(body: {
  role?: unknown;
  service_ids?: string[];
}): string | null {
  if (body.role !== undefined && !isValidStaffRole(body.role)) {
    return `Invalid role. Use one of: ${VALID_STAFF_ROLES.join(', ')}`;
  }
  const role = body.role as ValidStaffRole | undefined;
  if (role && isBookableStaffRole(role)) {
    const ids = body.service_ids;
    if (ids !== undefined && ids.length === 0) {
      return 'Service providers must have at least one assigned service';
    }
  }
  return null;
}
