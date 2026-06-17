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

/** MySQL reserved identifiers (e.g. notifications.`read`). */
function sqlColumn(name: string): string {
  return name === 'read' ? '`read`' : name;
}

function sqlValue(col: string, value: unknown): unknown {
  if (col === 'read') return value ? 1 : 0;
  return value;
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
  branchScopedList?: (branchId: string) => { sql: string; params: unknown[] };
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
    asyncHandler(async (req, res) => {
      const branchId = typeof req.query.branch_id === 'string' ? req.query.branch_id.trim() : '';
      if (branchId && options?.branchScopedList) {
        const { sql, params } = options.branchScopedList(branchId);
        const rows = await query<Record<string, unknown>[]>(sql, params);
        return res.json(rows.map(mapRow));
      }
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
      const values = cols.map((c) => (c === 'id' ? id : sqlValue(c, body[c])));
      await query(
        `INSERT INTO ${table} (${cols.map(sqlColumn).join(', ')}) VALUES (${placeholders})`,
        values,
      );
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
          fields.push(`${sqlColumn(col)} = ?`);
          values.push(sqlValue(col, body[col]));
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
  ['name', 'description', 'image_url', 'branch_id', 'status'],
  ['name'],
  {
    beforeDelete: categoryDeleteBlockers,
    branchScopedList: (branchId) => ({
      sql: `SELECT * FROM service_categories WHERE branch_id = ? ORDER BY created_at DESC`,
      params: [branchId],
    }),
  },
);

const COUPON_COLUMNS = [
  'code',
  'discount_type',
  'discount_value',
  'min_order',
  'max_uses',
  'used_count',
  'expiry_date',
  'status',
] as const;

async function prepareCouponBody(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { normalizeCouponMaxUses } = await import('../lib/couponValidation.js');
  const { resolveCouponStatusOnSave } = await import(
    '../../../shared/src/lib/coupon-lifecycle.js'
  );
  const max_uses = normalizeCouponMaxUses(body.max_uses);
  const expiry_date = body.expiry_date ?? null;
  const status = resolveCouponStatusOnSave(
    (body.status as 'active' | 'inactive' | 'expired') ?? 'active',
    typeof expiry_date === 'string' ? expiry_date : null,
  );
  return {
    ...body,
    code: typeof body.code === 'string' ? body.code.trim().toUpperCase() : body.code,
    max_uses,
    status,
    used_count: body.used_count ?? 0,
  };
}

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

couponsRouter.get(
  '/available',
  asyncHandler(async (req, res) => {
    const { listAvailableCouponsForCustomer } = await import('../lib/couponValidation.js');
    const email = typeof req.query.email === 'string' ? req.query.email.trim() : '';
    if (!email) {
      return res.status(400).json({ message: 'Customer email is required' });
    }
    const orderAmount =
      req.query.orderAmount != null ? Number(req.query.orderAmount) : undefined;
    const coupons = await listAvailableCouponsForCustomer(
      email,
      Number.isFinite(orderAmount) ? orderAmount : undefined,
    );
    res.json(coupons);
  }),
);

couponsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { expireCouponsPastDate } = await import('../lib/couponValidation.js');
    await expireCouponsPastDate();
    const rows = await query<Record<string, unknown>[]>(
      'SELECT * FROM coupons ORDER BY created_at DESC',
    );
    res.json(rows.map(mapRow));
  }),
);

couponsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { expireCouponsPastDate } = await import('../lib/couponValidation.js');
    await expireCouponsPastDate();
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM coupons WHERE id = ?', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(mapRow(rows[0]));
  }),
);

couponsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const err = validateRequired(req.body, ['code', 'discount_type', 'discount_value']);
    if (err) return res.status(400).json({ message: err });
    const body = await prepareCouponBody(req.body as Record<string, unknown>);
    const id = newId();
    const cols = ['id', ...COUPON_COLUMNS.filter((c) => body[c] !== undefined)];
    const placeholders = cols.map(() => '?').join(', ');
    const values = cols.map((c) => (c === 'id' ? id : sqlValue(c, body[c])));
    await query(
      `INSERT INTO coupons (${cols.map(sqlColumn).join(', ')}) VALUES (${placeholders})`,
      values,
    );
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM coupons WHERE id = ?', [id]);
    const created = mapRow(rows[0]);
    if (created.status === 'active') {
      const { notifyEligibleCustomersOfCoupon } = await import('../lib/couponNotifications.js');
      void notifyEligibleCustomersOfCoupon(created as import('../lib/couponNotifications.js').CouponNotifyRow).catch(
        (err) => console.error('Coupon notify failed:', err),
      );
    }
    res.status(201).json(created);
  }),
);

couponsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const existingRows = await query<Record<string, unknown>[]>('SELECT * FROM coupons WHERE id = ?', [
      req.params.id,
    ]);
    if (!existingRows[0]) return res.status(404).json({ message: 'Not found' });

    const input = req.body as Record<string, unknown>;
    const merged = await prepareCouponBody({ ...existingRows[0], ...input });
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const col of COUPON_COLUMNS) {
      if (input[col] !== undefined || (col === 'status' && input.expiry_date !== undefined)) {
        fields.push(`${sqlColumn(col)} = ?`);
        values.push(sqlValue(col, merged[col]));
      }
    }
    if (!fields.length) return res.status(400).json({ message: 'No fields' });
    values.push(req.params.id);
    await query(`UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`, values);
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM coupons WHERE id = ?', [
      req.params.id,
    ]);
    const updated = mapRow(rows[0]);
    const wasActive = String(existingRows[0].status) === 'active';
    if (!wasActive && updated.status === 'active') {
      const { notifyEligibleCustomersOfCoupon } = await import('../lib/couponNotifications.js');
      void notifyEligibleCustomersOfCoupon(updated as import('../lib/couponNotifications.js').CouponNotifyRow).catch(
        (err) => console.error('Coupon notify failed:', err),
      );
    }
    res.json(updated);
  }),
);

couponsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    res.status(204).send();
  }),
);

export const customersRouter = Router();
customersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const branchId = typeof req.query.branch_id === 'string' ? req.query.branch_id.trim() : '';
    if (branchId) {
      const rows = await query<Record<string, unknown>[]>(
        `SELECT DISTINCT u.id, u.email, u.full_name, u.phone, u.role, u.created_at, u.updated_at
         FROM users u
         INNER JOIN bookings b ON LOWER(b.customer_email) = LOWER(u.email)
         WHERE u.role = 'customer' AND b.branch_id = ?
         ORDER BY u.created_at DESC`,
        [branchId],
      );
      return res.json(rows.map(rowDates));
    }
    const rows = await query<Record<string, unknown>[]>(
      `SELECT id, email, full_name, phone, role, created_at, updated_at FROM users WHERE role = 'customer'`,
    );
    res.json(rows.map(rowDates));
  }),
);
