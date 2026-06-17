import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { serviceDeleteBlockers } from '../lib/deleteGuards.js';
import { query } from '../db.js';
import { newId, rowDates } from '../utils.js';

async function loadService(id: string, scopeBranchId?: string) {
  const rows = await query<Record<string, unknown>[]>('SELECT * FROM services WHERE id = ?', [id]);
  if (!rows[0]) return null;
  const branchRows = await query<{ branch_id: string }[]>(
    'SELECT branch_id FROM service_branches WHERE service_id = ?',
    [id],
  );
  const branch_ids = branchRows.map((r) => r.branch_id);
  if (scopeBranchId && !branch_ids.includes(scopeBranchId)) return null;

  const empSql = scopeBranchId
    ? `SELECT es.employee_id FROM employee_services es
       INNER JOIN employees e ON e.id = es.employee_id
       WHERE es.service_id = ? AND e.branch_id = ?`
    : 'SELECT employee_id FROM employee_services WHERE service_id = ?';
  const empParams = scopeBranchId ? [id, scopeBranchId] : [id];
  const empRows = await query<{ employee_id: string }[]>(empSql, empParams);

  return rowDates({
    ...rows[0],
    price: Number(rows[0].price),
    duration_minutes: Number(rows[0].duration_minutes),
    branch_ids: scopeBranchId ? [scopeBranchId] : branch_ids,
    employee_ids: empRows.map((r) => r.employee_id),
  });
}

async function loadServicesForBranch(branchId: string) {
  const rows = await query<{ id: string }[]>(
    `SELECT DISTINCT s.id FROM services s
     INNER JOIN service_branches sb ON sb.service_id = s.id AND sb.branch_id = ?
     ORDER BY s.title`,
    [branchId],
  );
  const list = await Promise.all(rows.map((r) => loadService(r.id, branchId)));
  return list.filter(Boolean);
}

async function loadAllServices() {
  const rows = await query<Record<string, unknown>[]>('SELECT * FROM services ORDER BY title');
  return Promise.all(rows.map((r) => loadService(String(r.id))));
}

async function setRelations(serviceId: string, branch_ids?: string[], employee_ids?: string[]) {
  if (branch_ids) {
    await query('DELETE FROM service_branches WHERE service_id = ?', [serviceId]);
    for (const branchId of branch_ids) {
      await query('INSERT INTO service_branches (service_id, branch_id) VALUES (?, ?)', [serviceId, branchId]);
    }
  }
  if (employee_ids) {
    await query('DELETE FROM employee_services WHERE service_id = ?', [serviceId]);
    for (const employeeId of employee_ids) {
      await query('INSERT INTO employee_services (employee_id, service_id) VALUES (?, ?)', [employeeId, serviceId]);
    }
  }
}

export const servicesRouter = Router();

servicesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const branchId = typeof req.query.branch_id === 'string' ? req.query.branch_id.trim() : '';
    const services = branchId ? await loadServicesForBranch(branchId) : (await loadAllServices()).filter(Boolean);
    res.json(services);
  }),
);

servicesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const service = await loadService(req.params.id);
    if (!service) return res.status(404).json({ message: 'Not found' });
    res.json(service);
  }),
);

servicesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const s = req.body;
    if (!s.title?.trim()) return res.status(400).json({ message: 'title is required' });
    if (!s.category_id) return res.status(400).json({ message: 'category_id is required' });
    if (s.price == null || Number(s.price) < 0) return res.status(400).json({ message: 'valid price is required' });
    if (!s.branch_ids?.length) return res.status(400).json({ message: 'at least one branch is required' });
    const id = newId();
    await query(
      `INSERT INTO services (id, title, description, price, duration_minutes, category_id, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        s.title,
        s.description ?? null,
        s.price,
        s.duration_minutes ?? 60,
        s.category_id,
        s.image_url ?? null,
        s.status ?? 'active',
      ],
    );
    await setRelations(id, s.branch_ids ?? [], s.employee_ids ?? []);
    const service = await loadService(id);
    res.status(201).json(service);
  }),
);

servicesRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const s = req.body;
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const key of ['title', 'description', 'price', 'duration_minutes', 'category_id', 'image_url', 'status'] as const) {
      if (s[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(s[key]);
      }
    }
    if (fields.length) {
      values.push(req.params.id);
      await query(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    await setRelations(req.params.id, s.branch_ids, s.employee_ids);
    const service = await loadService(req.params.id);
    if (!service) return res.status(404).json({ message: 'Not found' });
    res.json(service);
  }),
);

servicesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const blockMessage = await serviceDeleteBlockers(req.params.id);
    if (blockMessage) return res.status(409).json({ message: blockMessage });
    await query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.status(204).send();
  }),
);
