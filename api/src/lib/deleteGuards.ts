import { query } from '../db.js';

export async function branchDeleteBlockers(branchId: string): Promise<string | null> {
  const bookingRows = await query<{ c: number }[]>(
    'SELECT COUNT(*) AS c FROM bookings WHERE branch_id = ?',
    [branchId],
  );
  const employeeRows = await query<{ c: number }[]>(
    'SELECT COUNT(*) AS c FROM employees WHERE branch_id = ?',
    [branchId],
  );
  const payoutRows = await query<{ c: number }[]>(
    'SELECT COUNT(*) AS c FROM staff_payouts WHERE branch_id = ?',
    [branchId],
  ).catch(() => [{ c: 0 }]);

  const parts: string[] = [];
  const bookings = Number(bookingRows[0]?.c ?? 0);
  const employees = Number(employeeRows[0]?.c ?? 0);
  const payouts = Number(payoutRows[0]?.c ?? 0);

  if (bookings > 0) parts.push(`${bookings} booking${bookings === 1 ? '' : 's'}`);
  if (employees > 0) parts.push(`${employees} staff member${employees === 1 ? '' : 's'}`);
  if (payouts > 0) parts.push(`${payouts} payout record${payouts === 1 ? '' : 's'}`);

  if (!parts.length) return null;
  return `Cannot delete this branch — it is linked to ${parts.join(', ')}. Reassign staff, cancel or complete bookings, then try again.`;
}

export async function categoryDeleteBlockers(categoryId: string): Promise<string | null> {
  const rows = await query<{ c: number }[]>(
    'SELECT COUNT(*) AS c FROM services WHERE category_id = ?',
    [categoryId],
  );
  const count = Number(rows[0]?.c ?? 0);
  if (count === 0) return null;
  return `Cannot delete this category — ${count} service${count === 1 ? '' : 's'} still use it. Move or delete those services first.`;
}

export async function serviceDeleteBlockers(serviceId: string): Promise<string | null> {
  const bookingRows = await query<{ c: number }[]>(
    'SELECT COUNT(*) AS c FROM bookings WHERE service_id = ?',
    [serviceId],
  );
  const count = Number(bookingRows[0]?.c ?? 0);
  if (count === 0) return null;
  return `Cannot delete this service — ${count} booking${count === 1 ? '' : 's'} reference it.`;
}

export async function employeeDeleteBlockers(employeeId: string): Promise<string | null> {
  const bookingRows = await query<{ c: number }[]>(
    'SELECT COUNT(*) AS c FROM bookings WHERE employee_id = ?',
    [employeeId],
  );
  const payoutRows = await query<{ c: number }[]>(
    'SELECT COUNT(*) AS c FROM staff_payouts WHERE employee_id = ?',
    [employeeId],
  ).catch(() => [{ c: 0 }]);

  const parts: string[] = [];
  const bookings = Number(bookingRows[0]?.c ?? 0);
  const payouts = Number(payoutRows[0]?.c ?? 0);
  if (bookings > 0) parts.push(`${bookings} booking${bookings === 1 ? '' : 's'}`);
  if (payouts > 0) parts.push(`${payouts} payout${payouts === 1 ? '' : 's'}`);

  if (!parts.length) return null;
  return `Cannot delete this staff member — linked to ${parts.join(' and ')}.`;
}
