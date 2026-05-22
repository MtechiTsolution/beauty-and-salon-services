/** Salon staff job roles (stored in `employees.role`). */
export const STAFF_ROLES = [
  { id: 'manager', label: 'Manager', group: 'Operations', bookable: false },
  { id: 'receptionist', label: 'Receptionist', group: 'Operations', bookable: false },
  { id: 'stylist', label: 'Stylist', group: 'Service providers', bookable: true },
  { id: 'threading_trimming', label: 'Threading & Trimming', group: 'Service providers', bookable: true },
  { id: 'hairdresser', label: 'Hair Dresser', group: 'Service providers', bookable: true },
  { id: 'massage_expert', label: 'Deep Massage Expert', group: 'Service providers', bookable: true },
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number]['id'];

export const STAFF_ROLE_IDS: StaffRole[] = STAFF_ROLES.map((r) => r.id);

const roleById = new Map(STAFF_ROLES.map((r) => [r.id, r]));

export function isValidStaffRole(role: string): role is StaffRole {
  return STAFF_ROLE_IDS.includes(role as StaffRole);
}

export function getStaffRoleLabel(role: string): string {
  return roleById.get(role as StaffRole)?.label ?? role.replace(/_/g, ' ');
}

export function isBookableStaffRole(role: string): boolean {
  return roleById.get(role as StaffRole)?.bookable ?? false;
}

export function staffRoleRequiresServices(role: string): boolean {
  return isBookableStaffRole(role);
}

export type StaffFormShape = {
  name: string;
  email: string;
  branch_id: string;
  role: StaffRole;
  service_ids: string[];
};

export function validateStaffForm(form: StaffFormShape): string | null {
  if (!form.name.trim()) return 'Full name is required';
  if (!form.email.trim()) return 'Email is required';
  if (!form.branch_id?.trim()) return 'Assign a branch';
  if (!isValidStaffRole(form.role)) return 'Select a valid staff role';
  if (staffRoleRequiresServices(form.role) && (!form.service_ids || form.service_ids.length === 0)) {
    return 'Service providers must be assigned at least one service they can perform';
  }
  return null;
}

type StaffBookingCandidate = {
  status: string;
  branch_id: string;
  role: StaffRole | string;
  service_ids?: string[];
};

export function filterStaffForBooking<T extends StaffBookingCandidate>(
  employees: T[],
  branchId: string,
  serviceId: string,
): T[] {
  return employees.filter(
    (e) =>
      e.status === 'active' &&
      e.branch_id === branchId &&
      isBookableStaffRole(e.role) &&
      (e.service_ids?.includes(serviceId) ?? false),
  );
}

/** Staff who can perform at least one service included in a package. */
export function filterStaffForPackage<T extends StaffBookingCandidate>(
  employees: T[],
  branchId: string,
  packageServiceIds: string[],
): T[] {
  if (!packageServiceIds.length) return [];
  return employees.filter(
    (e) =>
      e.status === 'active' &&
      e.branch_id === branchId &&
      isBookableStaffRole(e.role) &&
      packageServiceIds.some((sid) => e.service_ids?.includes(sid)),
  );
}

export const STAFF_ROLE_GROUPS = ['Operations', 'Service providers'] as const;
