import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { employeeDeleteBlockers } from '../lib/deleteGuards.js';
import { isBookableStaffRole, isValidStaffRole, validateStaffPayload } from '../lib/staffRoles.js';
import { query } from '../db.js';
import { newId, rowDates } from '../utils.js';

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

async function loadEmployee(id: string, scopeBranchId?: string) {
  const rows = await query<Record<string, unknown>[]>('SELECT * FROM employees WHERE id = ?', [id]);
  if (!rows[0]) return null;
  if (scopeBranchId && String(rows[0].branch_id) !== scopeBranchId) return null;

  const svcSql = scopeBranchId
    ? `SELECT es.service_id FROM employee_services es
       INNER JOIN service_branches sb ON sb.service_id = es.service_id AND sb.branch_id = ?
       WHERE es.employee_id = ?`
    : 'SELECT service_id FROM employee_services WHERE employee_id = ?';
  const svcParams = scopeBranchId ? [scopeBranchId, id] : [id];
  const svcRows = await query<{ service_id: string }[]>(svcSql, svcParams);

  return rowDates({
    ...rows[0],
    rating: rows[0].rating != null ? Number(rows[0].rating) : undefined,
    service_ids: svcRows.map((r) => r.service_id),
  });
}

export const employeesRouter = Router();

employeesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { role, branch_id, bookable } = req.query;
    let sql = 'SELECT id FROM employees WHERE 1=1';
    const params: unknown[] = [];
    if (role && typeof role === 'string') {
      if (!isValidStaffRole(role)) {
        return res.status(400).json({ message: 'Invalid role filter' });
      }
      sql += ' AND role = ?';
      params.push(role);
    }
    if (branch_id && typeof branch_id === 'string') {
      sql += ' AND branch_id = ?';
      params.push(branch_id);
    }
    sql += ' ORDER BY name';
    const rows = await query<{ id: string }[]>(sql, params);
    const branchId = typeof branch_id === 'string' ? branch_id.trim() : '';
    let list = (await Promise.all(rows.map((r) => loadEmployee(r.id, branchId || undefined)))).filter(Boolean);
    if (bookable === 'true') {
      list = list.filter((e) => e && isBookableStaffRole(String(e.role)));
    }
    res.json(list);
  }),
);

employeesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const emp = await loadEmployee(paramId(req.params.id));
    if (!emp) return res.status(404).json({ message: 'Not found' });
    res.json(emp);
  }),
);

employeesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const e = req.body;
    if (!e.name?.trim() || !e.email?.trim()) {
      return res.status(400).json({ message: 'name and email are required' });
    }
    if (!e.branch_id || !String(e.branch_id).trim()) {
      return res.status(400).json({ message: 'branch_id is required — select a branch' });
    }
    const roleErr = validateStaffPayload({ role: e.role ?? 'stylist', service_ids: e.service_ids ?? [] });
    if (roleErr) return res.status(400).json({ message: roleErr });
    if (e.role && !isValidStaffRole(e.role)) {
      return res.status(400).json({ message: 'Invalid staff role' });
    }
    if (isBookableStaffRole(String(e.role ?? 'stylist')) && !(e.service_ids?.length > 0)) {
      return res.status(400).json({ message: 'Service providers must be assigned at least one service' });
    }
    const id = newId();
    await query(
      `INSERT INTO employees (id, name, email, phone, role, branch_id, image_url, bio, rating, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        e.name,
        e.email,
        e.phone ?? null,
        e.role ?? 'stylist',
        e.branch_id,
        e.image_url ?? null,
        e.bio ?? null,
        e.rating ?? null,
        e.status ?? 'active',
      ],
    );
    if (e.service_ids?.length) {
      for (const serviceId of e.service_ids) {
        await query('INSERT IGNORE INTO employee_services (employee_id, service_id) VALUES (?, ?)', [
          id,
          serviceId,
        ]);
      }
    }
    res.status(201).json(await loadEmployee(id));
  }),
);

employeesRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = paramId(req.params.id);
    const e = req.body;
    if (e.branch_id !== undefined && !String(e.branch_id).trim()) {
      return res.status(400).json({ message: 'branch_id cannot be empty' });
    }
    const existing = await loadEmployee(id);
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const nextRole = e.role !== undefined ? e.role : existing.role;
    const nextServiceIds = e.service_ids !== undefined ? e.service_ids : existing.service_ids;
    const roleErr = validateStaffPayload({ role: nextRole, service_ids: nextServiceIds });
    if (roleErr) return res.status(400).json({ message: roleErr });
    if (e.role !== undefined && !isValidStaffRole(e.role)) {
      return res.status(400).json({ message: 'Invalid staff role' });
    }
    if (isBookableStaffRole(String(nextRole)) && !(nextServiceIds?.length > 0)) {
      return res.status(400).json({ message: 'Service providers must be assigned at least one service' });
    }
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const key of ['name', 'email', 'phone', 'role', 'branch_id', 'image_url', 'bio', 'rating', 'status'] as const) {
      if (e[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(e[key]);
      }
    }
    if (fields.length) {
      values.push(id);
      await query(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    if (e.service_ids) {
      await query('DELETE FROM employee_services WHERE employee_id = ?', [id]);
      for (const serviceId of e.service_ids) {
        await query('INSERT INTO employee_services (employee_id, service_id) VALUES (?, ?)', [id, serviceId]);
      }
    }
    const emp = await loadEmployee(id);
    if (!emp) return res.status(404).json({ message: 'Not found' });
    res.json(emp);
  }),
);

employeesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = paramId(req.params.id);
    const blockMessage = await employeeDeleteBlockers(id);
    if (blockMessage) return res.status(409).json({ message: blockMessage });
    await query('DELETE FROM employees WHERE id = ?', [id]);
    res.status(204).send();
  }),
);
