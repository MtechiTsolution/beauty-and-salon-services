import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { query } from '../db.js';
import { newId, rowDates } from '../utils.js';

async function loadPackage(id: string, scopeBranchId?: string) {
  const rows = await query<Record<string, unknown>[]>('SELECT * FROM packages WHERE id = ?', [id]);
  if (!rows[0]) return null;
  const brRows = await query<{ branch_id: string }[]>(
    'SELECT branch_id FROM package_branches WHERE package_id = ?',
    [id],
  );
  const branch_ids = brRows.map((r) => r.branch_id);
  if (scopeBranchId && !branch_ids.includes(scopeBranchId)) return null;

  const svcSql = scopeBranchId
    ? `SELECT ps.service_id FROM package_services ps
       INNER JOIN service_branches sb ON sb.service_id = ps.service_id AND sb.branch_id = ?
       WHERE ps.package_id = ?`
    : 'SELECT service_id FROM package_services WHERE package_id = ?';
  const svcParams = scopeBranchId ? [scopeBranchId, id] : [id];
  const svcRows = await query<{ service_id: string }[]>(svcSql, svcParams);

  return rowDates({
    ...rows[0],
    price: Number(rows[0].price),
    total_sessions: Number(rows[0].total_sessions),
    validity_days: Number(rows[0].validity_days),
    service_ids: svcRows.map((r) => r.service_id),
    branch_ids: scopeBranchId ? [scopeBranchId] : branch_ids,
  });
}

async function loadPackagesForBranch(branchId: string) {
  const rows = await query<{ id: string }[]>(
    `SELECT DISTINCT p.id FROM packages p
     INNER JOIN package_branches pb ON pb.package_id = p.id AND pb.branch_id = ?
     ORDER BY p.name`,
    [branchId],
  );
  const list = await Promise.all(rows.map((r) => loadPackage(r.id, branchId)));
  return list.filter(Boolean);
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
  asyncHandler(async (req, res) => {
    const branchId = typeof req.query.branch_id === 'string' ? req.query.branch_id.trim() : '';
    const list = branchId
      ? await loadPackagesForBranch(branchId)
      : (await Promise.all(
          (await query<{ id: string }[]>('SELECT id FROM packages ORDER BY name')).map((r) => loadPackage(r.id)),
        )).filter(Boolean);
    res.json(list);
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
