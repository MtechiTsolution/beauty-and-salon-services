import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { query } from '../db.js';
import { newId, rowDates } from '../utils.js';

async function loadPackage(id: string) {
  const rows = await query<Record<string, unknown>[]>('SELECT * FROM packages WHERE id = ?', [id]);
  if (!rows[0]) return null;
  const svcRows = await query<{ service_id: string }[]>(
    'SELECT service_id FROM package_services WHERE package_id = ?',
    [id],
  );
  const brRows = await query<{ branch_id: string }[]>(
    'SELECT branch_id FROM package_branches WHERE package_id = ?',
    [id],
  );
  return rowDates({
    ...rows[0],
    price: Number(rows[0].price),
    total_sessions: Number(rows[0].total_sessions),
    validity_days: Number(rows[0].validity_days),
    service_ids: svcRows.map((r) => r.service_id),
    branch_ids: brRows.map((r) => r.branch_id),
  });
}

async function setRelations(packageId: string, service_ids?: string[], branch_ids?: string[]) {
  if (service_ids) {
    await query('DELETE FROM package_services WHERE package_id = ?', [packageId]);
    for (const serviceId of service_ids) {
      await query('INSERT INTO package_services (package_id, service_id) VALUES (?, ?)', [
        packageId,
        serviceId,
      ]);
    }
  }
  if (branch_ids) {
    await query('DELETE FROM package_branches WHERE package_id = ?', [packageId]);
    for (const branchId of branch_ids) {
      await query('INSERT INTO package_branches (package_id, branch_id) VALUES (?, ?)', [
        packageId,
        branchId,
      ]);
    }
  }
}

export const packagesRouter = Router();

packagesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await query<{ id: string }[]>('SELECT id FROM packages ORDER BY name');
    const list = await Promise.all(rows.map((r) => loadPackage(r.id)));
    res.json(list.filter(Boolean));
  }),
);

packagesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const pkg = await loadPackage(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Not found' });
    res.json(pkg);
  }),
);

packagesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const p = req.body;
    if (!p.name?.trim()) return res.status(400).json({ message: 'name is required' });
    if (p.price == null || Number(p.price) <= 0) return res.status(400).json({ message: 'price must be greater than 0' });
    const id = newId();
    await query(
      `INSERT INTO packages (id, name, description, price, total_sessions, validity_days, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        p.name,
        p.description ?? null,
        p.price,
        p.total_sessions ?? 1,
        p.validity_days ?? 30,
        p.image_url ?? null,
        p.status ?? 'active',
      ],
    );
    await setRelations(id, p.service_ids ?? [], p.branch_ids ?? []);
    res.status(201).json(await loadPackage(id));
  }),
);

packagesRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const p = req.body;
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const key of [
      'name',
      'description',
      'price',
      'total_sessions',
      'validity_days',
      'image_url',
      'status',
    ] as const) {
      if (p[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(p[key]);
      }
    }
    if (fields.length) {
      values.push(req.params.id);
      await query(`UPDATE packages SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    await setRelations(req.params.id, p.service_ids, p.branch_ids);
    const pkg = await loadPackage(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Not found' });
    res.json(pkg);
  }),
);

packagesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await query('DELETE FROM packages WHERE id = ?', [req.params.id]);
    res.status(204).send();
  }),
);
