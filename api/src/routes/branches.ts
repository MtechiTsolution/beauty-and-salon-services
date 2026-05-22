import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { branchDeleteBlockers } from '../lib/deleteGuards.js';
import { query } from '../db.js';
import { newId, rowDates } from '../utils.js';

export const branchesRouter = Router();

branchesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM branches ORDER BY name');
    res.json(rows.map(rowDates));
  }),
);

branchesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM branches WHERE id = ?', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(rowDates(rows[0]));
  }),
);

branchesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b.name?.trim() || !b.address?.trim()) {
      return res.status(400).json({ message: 'name and address are required' });
    }
    const id = newId();
    await query(
      `INSERT INTO branches (id, name, address, city, phone, email, image_url, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        b.name,
        b.address,
        b.city ?? null,
        b.phone ?? null,
        b.email ?? null,
        b.image_url ?? null,
        b.description ?? null,
        b.status ?? 'active',
      ],
    );
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM branches WHERE id = ?', [id]);
    res.status(201).json(rowDates(rows[0]));
  }),
);

branchesRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const b = req.body;
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const key of ['name', 'address', 'city', 'phone', 'email', 'image_url', 'description', 'status'] as const) {
      if (b[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(b[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ message: 'No fields' });
    values.push(req.params.id);
    await query(`UPDATE branches SET ${fields.join(', ')} WHERE id = ?`, values);
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM branches WHERE id = ?', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(rowDates(rows[0]));
  }),
);

branchesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const blockMessage = await branchDeleteBlockers(req.params.id);
    if (blockMessage) {
      return res.status(409).json({ message: blockMessage });
    }
    await query('DELETE FROM branches WHERE id = ?', [req.params.id]);
    res.status(204).send();
  }),
);
