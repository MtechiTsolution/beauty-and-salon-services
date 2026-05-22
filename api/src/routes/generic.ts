import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { categoryDeleteBlockers } from '../lib/deleteGuards.js';
import { query } from '../db.js';
import { newId, rowDates } from '../utils.js';

const NUMERIC = new Set(['price', 'discount_value', 'min_order', 'discount', 'final_price', 'rating', 'used_count', 'max_uses', 'total_sessions', 'validity_days']);

function mapRow(row: Record<string, unknown>) {
  const out = rowDates(row);
  for (const key of NUMERIC) {
    if (key in out && out[key] != null) (out as Record<string, unknown>)[key] = Number(out[key]);
  }
  if ('read' in out) (out as Record<string, unknown>).read = Boolean(out.read);
  return out;
}

function validateRequired(body: Record<string, unknown>, fields: string[]) {
  for (const field of fields) {
    const v = body[field];
    if (v === undefined || v === null || (typeof v === 'string' && !v.trim())) {
      return `${field} is required`;
    }
  }
  return null;
}

type TableRouterOptions = {
  beforeDelete?: (id: string) => Promise<string | null>;
};

export function createTableRouter(
  table: string,
  columns: string[],
  requiredOnCreate: string[] = [],
  options?: TableRouterOptions,
) {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const rows = await query<Record<string, unknown>[]>(`SELECT * FROM ${table} ORDER BY created_at DESC`);
      res.json(rows.map(mapRow));
    }),
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const rows = await query<Record<string, unknown>[]>(`SELECT * FROM ${table} WHERE id = ?`, [
        req.params.id,
      ]);
      if (!rows[0]) return res.status(404).json({ message: 'Not found' });
      res.json(mapRow(rows[0]));
    }),
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const body = req.body as Record<string, unknown>;
      const err = validateRequired(body, requiredOnCreate);
      if (err) return res.status(400).json({ message: err });

      const id = newId();
      const cols = ['id', ...columns.filter((c) => body[c] !== undefined)];
      if (cols.length <= 1) {
        return res.status(400).json({ message: 'No data provided' });
      }
      const placeholders = cols.map(() => '?').join(', ');
      const values = cols.map((c) => (c === 'id' ? id : body[c]));
      await query(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`, values);
      const rows = await query<Record<string, unknown>[]>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      res.status(201).json(mapRow(rows[0]));
    }),
  );

  router.patch(
    '/:id',
    asyncHandler(async (req, res) => {
      const body = req.body as Record<string, unknown>;
      const fields: string[] = [];
      const values: unknown[] = [];
      for (const col of columns) {
        if (body[col] !== undefined) {
          fields.push(`${col} = ?`);
          values.push(body[col]);
        }
      }
      if (!fields.length) return res.status(400).json({ message: 'No fields' });
      values.push(req.params.id);
      await query(`UPDATE ${table} SET ${fields.join(', ')} WHERE id = ?`, values);
      const rows = await query<Record<string, unknown>[]>(`SELECT * FROM ${table} WHERE id = ?`, [
        req.params.id,
      ]);
      if (!rows[0]) return res.status(404).json({ message: 'Not found' });
      res.json(mapRow(rows[0]));
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      if (options?.beforeDelete) {
        const blockMessage = await options.beforeDelete(req.params.id);
        if (blockMessage) return res.status(409).json({ message: blockMessage });
      }
      await query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      res.status(204).send();
    }),
  );

  return router;
}

export const categoriesRouter = createTableRouter(
  'service_categories',
  ['name', 'description', 'image_url', 'status'],
  ['name'],
  { beforeDelete: categoryDeleteBlockers },
);

export const couponsRouter = Router();

couponsRouter.get(
  '/validate/:code',
  asyncHandler(async (req, res) => {
    const { validateCouponForCustomer } = await import('../lib/couponValidation.js');
    const email = typeof req.query.email === 'string' ? req.query.email.trim() : '';
    if (!email) {
      return res.status(400).json({ message: 'Customer email is required to validate a coupon' });
    }
    const orderAmount =
      req.query.orderAmount != null ? Number(req.query.orderAmount) : undefined;
    const result = await validateCouponForCustomer(
      req.params.code,
      email,
      Number.isFinite(orderAmount) ? orderAmount : undefined,
    );
    res.json(result);
  }),
);

const couponsBase = createTableRouter(
  'coupons',
  ['code', 'discount_type', 'discount_value', 'min_order', 'max_uses', 'used_count', 'expiry_date', 'status'],
  ['code', 'discount_type', 'discount_value'],
);
couponsRouter.use('/', couponsBase);

export const notificationsRouter = createTableRouter(
  'notifications',
  ['user_email', 'title', 'message', 'type', 'read', 'reference_id'],
  ['title', 'message'],
);

export const customersRouter = Router();
customersRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await query<Record<string, unknown>[]>(
      `SELECT id, email, full_name, phone, role, created_at, updated_at FROM users WHERE role = 'customer'`,
    );
    res.json(rows.map(rowDates));
  }),
);
