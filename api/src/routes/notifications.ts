import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { query } from '../db.js';
import { listAnnouncements, sendAnnouncement } from '../lib/notifications.js';
import { newId, rowDates } from '../utils.js';

const COLUMNS = ['user_email', 'title', 'message', 'type', 'read', 'reference_id'] as const;

function mapRow(row: Record<string, unknown>) {
  const out = rowDates(row);
  if ('read' in out) (out as Record<string, unknown>).read = Boolean(out.read);
  return out;
}

function sqlColumn(name: string): string {
  return name === 'read' ? '`read`' : name;
}

function sqlValue(col: string, value: unknown): unknown {
  if (col === 'read') return value ? 1 : 0;
  return value;
}

function isCustomerAppAdminNotification(row: Record<string, unknown>): boolean {
  const email = row.user_email;
  const hasEmail = email != null && String(email).trim().length > 0;
  const ref = row.reference_id;
  const hasRef = ref != null && String(ref).trim().length > 0;
  return !hasEmail && hasRef;
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

export const notificationsRouter = Router();

notificationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userEmail = typeof req.query.user_email === 'string' ? req.query.user_email.trim() : '';
    const audience = typeof req.query.audience === 'string' ? req.query.audience.trim() : '';

    let sql = 'SELECT * FROM notifications WHERE 1=1';
    const params: unknown[] = [];

    if (userEmail) {
      sql += ' AND LOWER(user_email) = LOWER(?)';
      params.push(userEmail);
    } else if (audience === 'admin') {
      sql += ' AND user_email IS NULL';
    }

    sql += ' ORDER BY created_at DESC';
    const rows = await query<Record<string, unknown>[]>(sql, params);
    res.json(rows.map(mapRow));
  }),
);

notificationsRouter.post(
  '/mark-all-read',
  asyncHandler(async (req, res) => {
    const { user_email: userEmail } = req.body as { user_email?: string };
    const email = userEmail?.trim();
    if (!email) return res.status(400).json({ message: 'user_email is required' });

    await query(
      'UPDATE notifications SET `read` = 1 WHERE LOWER(user_email) = LOWER(?) AND `read` = 0',
      [email],
    );
    res.json({ ok: true });
  }),
);

notificationsRouter.get(
  '/announcements',
  asyncHandler(async (_req, res) => {
    res.json(await listAnnouncements());
  }),
);

notificationsRouter.post(
  '/announcements',
  asyncHandler(async (req, res) => {
    const { title, message, audience, emails } = req.body as {
      title?: string;
      message?: string;
      audience?: 'all' | 'selected';
      emails?: string[];
    };

    if (audience !== 'all' && audience !== 'selected') {
      return res.status(400).json({ message: 'audience must be all or selected' });
    }

    try {
      const result = await sendAnnouncement({
        title: title ?? '',
        message: message ?? '',
        audience,
        emails,
      });
      res.status(201).json(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not send announcement';
      return res.status(400).json({ message: msg });
    }
  }),
);

notificationsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM notifications WHERE id = ?', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(mapRow(rows[0]));
  }),
);

notificationsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const err = validateRequired(body, ['title', 'message']);
    if (err) return res.status(400).json({ message: err });

    if (body.user_email != null && String(body.user_email).trim()) {
      return res.status(400).json({
        message: 'Customer notifications must be sent from Announcements in the admin panel',
      });
    }

    const id = newId();
    const cols = ['id', ...COLUMNS.filter((c) => body[c] !== undefined)];
    if (cols.length <= 1) return res.status(400).json({ message: 'No data provided' });

    const placeholders = cols.map(() => '?').join(', ');
    const values = cols.map((c) => (c === 'id' ? id : sqlValue(c, body[c])));
    await query(
      `INSERT INTO notifications (${cols.map(sqlColumn).join(', ')}) VALUES (${placeholders})`,
      values,
    );
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM notifications WHERE id = ?', [id]);
    res.status(201).json(mapRow(rows[0]));
  }),
);

notificationsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await query<Record<string, unknown>[]>('SELECT * FROM notifications WHERE id = ?', [
      req.params.id,
    ]);
    if (!existing[0]) return res.status(404).json({ message: 'Not found' });

    const body = req.body as Record<string, unknown>;
    const locked = isCustomerAppAdminNotification(existing[0]);
    const fields: string[] = [];
    const values: unknown[] = [];

    if (locked) {
      const disallowed = COLUMNS.filter(
        (col) => col !== 'read' && body[col] !== undefined,
      );
      if (disallowed.length > 0) {
        return res.status(403).json({
          message: 'Customer notifications cannot be edited. You can only mark them as read.',
        });
      }
    }

    for (const col of COLUMNS) {
      if (body[col] !== undefined) {
        fields.push(`${sqlColumn(col)} = ?`);
        values.push(sqlValue(col, body[col]));
      }
    }
    if (!fields.length) return res.status(400).json({ message: 'No fields' });
    values.push(req.params.id);
    await query(`UPDATE notifications SET ${fields.join(', ')} WHERE id = ?`, values);
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM notifications WHERE id = ?', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(mapRow(rows[0]));
  }),
);

notificationsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await query<Record<string, unknown>[]>('SELECT * FROM notifications WHERE id = ?', [
      req.params.id,
    ]);
    if (!existing[0]) return res.status(404).json({ message: 'Not found' });
    if (isCustomerAppAdminNotification(existing[0])) {
      return res.status(403).json({ message: 'Customer notifications cannot be deleted' });
    }
    await query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.status(204).send();
  }),
);
