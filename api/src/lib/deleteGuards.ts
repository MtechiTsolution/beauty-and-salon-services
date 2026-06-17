import { query } from '../db.js';

async function countQuery(sql: string, params: unknown[]): Promise<number> {
  const rows = await query<{ c: number }[]>(sql, params);
  return Number(rows[0]?.c ?? 0);
}

async function countQuerySafe(sql: string, params: unknown[]): Promise<number> {
  try {
    return await countQuery(sql, params);
  } catch {
    return 0;
  }
}

export async function branchDeleteBlockers(branchId: string): Promise<string | null> {
  const bookings = await countQuery(
    'SELECT COUNT(*) AS c FROM bookings WHERE branch_id = ?',
    [branchId],
  );
  if (bookings > 0) {
    return `Cannot delete this saloon — ${bookings} booking${bookings === 1 ? '' : 's'} are linked to it. Cancel or remove those bookings first.`;
  }

  const payouts = await countQuerySafe(
    'SELECT COUNT(*) AS c FROM staff_payouts WHERE branch_id = ?',
    [branchId],
  );
  if (payouts > 0) {
    return `Cannot delete this saloon — ${payouts} payout record${payouts === 1 ? '' : 's'} are linked to it.`;
  }

  const chats = await countQuerySafe(
    'SELECT COUNT(*) AS c FROM booking_chats WHERE branch_id = ?',
    [branchId],
  );
  if (chats > 0) {
    return `Cannot delete this saloon — ${chats} booking chat${chats === 1 ? '' : 's'} are still linked to it.`;
  }

  const employees = await query<{ id: string; name: string }[]>(
    'SELECT id, name FROM employees WHERE branch_id = ?',
    [branchId],
  );

  for (const employee of employees) {
    const employeeBookings = await countQuery(
      'SELECT COUNT(*) AS c FROM bookings WHERE employee_id = ?',
      [employee.id],
    );
    if (employeeBookings > 0) {
      return `Cannot delete this saloon — staff member "${employee.name}" has booking history. Remove or reassign them first.`;
    }

    const employeePayouts = await countQuerySafe(
      'SELECT COUNT(*) AS c FROM staff_payouts WHERE employee_id = ?',
      [employee.id],
    );
    if (employeePayouts > 0) {
      return `Cannot delete this saloon — staff member "${employee.name}" has payout records.`;
    }
  }

  return null;
}

/** Removes staff and other rows that block branch deletion (when blockers pass). */
export async function deleteBranchDependencies(branchId: string): Promise<void> {
  const employees = await query<{ id: string }[]>(
    'SELECT id FROM employees WHERE branch_id = ?',
    [branchId],
  );

  for (const { id } of employees) {
    await query('DELETE FROM employee_services WHERE employee_id = ?', [id]);
    await query('DELETE FROM employees WHERE id = ?', [id]);
  }

  try {
    await query('UPDATE reviews SET branch_id = NULL WHERE branch_id = ?', [branchId]);
  } catch {
    // ignore if reviews table or column is unavailable
  }
}

export async function categoryDeleteBlockers(categoryId: string): Promise<string | null> {
  const count = await countQuery(
    'SELECT COUNT(*) AS c FROM services WHERE category_id = ?',
    [categoryId],
  );
  if (count === 0) return null;
  return `Cannot delete this category — ${count} service${count === 1 ? '' : 's'} still use it. Move or delete those services first.`;
}

export async function serviceDeleteBlockers(serviceId: string): Promise<string | null> {
  const count = await countQuery(
    'SELECT COUNT(*) AS c FROM bookings WHERE service_id = ?',
    [serviceId],
  );
  if (count === 0) return null;
  return `Cannot delete this service — ${count} booking${count === 1 ? '' : 's'} reference it.`;
}

export async function employeeDeleteBlockers(employeeId: string): Promise<string | null> {
  const bookings = await countQuery(
    'SELECT COUNT(*) AS c FROM bookings WHERE employee_id = ?',
    [employeeId],
  );
  const payouts = await countQuerySafe(
    'SELECT COUNT(*) AS c FROM staff_payouts WHERE employee_id = ?',
    [employeeId],
  );

  const parts: string[] = [];
  if (bookings > 0) parts.push(`${bookings} booking${bookings === 1 ? '' : 's'}`);
  if (payouts > 0) parts.push(`${payouts} payout${payouts === 1 ? '' : 's'}`);

  if (!parts.length) return null;
  return `Cannot delete this staff member — linked to ${parts.join(' and ')}.`;
}
