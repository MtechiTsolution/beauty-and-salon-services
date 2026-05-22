import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { query } from '../db.js';
import { newId, rowDates } from '../utils.js';

function mapPayout(row: Record<string, unknown>) {
  return rowDates({ ...row, amount: Number(row.amount) });
}

export const payoutsRouter = Router();

payoutsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await query<Record<string, unknown>[]>(
      'SELECT * FROM staff_payouts ORDER BY period_end DESC',
    );
    res.json(rows.map(mapPayout));
  }),
);

payoutsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM staff_payouts WHERE id = ?', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(mapPayout(rows[0]));
  }),
);

payoutsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const p = req.body;
    if (!p.employee_id || !p.employee_name) {
      return res.status(400).json({ message: 'employee_id and employee_name are required' });
    }
    if (p.amount == null || Number(p.amount) <= 0) {
      return res.status(400).json({ message: 'amount must be greater than 0' });
    }
    if (!p.period_start || !p.period_end) {
      return res.status(400).json({ message: 'period_start and period_end are required' });
    }
    const id = newId();
    const branchId = p.branch_id && String(p.branch_id).trim() ? p.branch_id : null;
    await query(
      `INSERT INTO staff_payouts (id, employee_id, employee_name, branch_id, amount, period_start, period_end, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        p.employee_id,
        p.employee_name,
        branchId,
        p.amount,
        p.period_start,
        p.period_end,
        p.status ?? 'pending',
        p.notes ?? null,
      ],
    );
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM staff_payouts WHERE id = ?', [id]);
    res.status(201).json(mapPayout(rows[0]));
  }),
);

payoutsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const p = req.body;
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const key of [
      'employee_id',
      'employee_name',
      'amount',
      'period_start',
      'period_end',
      'status',
      'notes',
    ] as const) {
      if (p[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(p[key]);
      }
    }
    if (p.branch_id !== undefined) {
      fields.push('branch_id = ?');
      values.push(p.branch_id && String(p.branch_id).trim() ? p.branch_id : null);
    }
    if (!fields.length) return res.status(400).json({ message: 'No fields' });
    values.push(req.params.id);
    await query(`UPDATE staff_payouts SET ${fields.join(', ')} WHERE id = ?`, values);
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM staff_payouts WHERE id = ?', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(mapPayout(rows[0]));
  }),
);

payoutsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await query('DELETE FROM staff_payouts WHERE id = ?', [req.params.id]);
    res.status(204).send();
  }),
);
