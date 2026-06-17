import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { query } from '../db.js';
import { newId, rowDates } from '../utils.js';

type UserRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'admin' | 'customer';
  password_hash: string;
  created_at: unknown;
  updated_at: unknown;
};

function toUser(row: UserRow) {
  const { password_hash: _, ...user } = rowDates(row);
  return user;
}

export const authRouter = Router();

authRouter.get('/me', asyncHandler(async (req, res) => {
  const userId = req.header('X-User-Id');
  if (!userId) return res.json(null);
  const rows = await query<UserRow[]>('SELECT * FROM users WHERE id = ?', [userId]);
  if (!rows[0]) return res.json(null);
  res.json(toUser(rows[0]));
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email) return res.status(400).json({ message: 'Email required' });
  const rows = await query<UserRow[]>('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });
  const ok = await bcrypt.compare(password ?? '', user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
  res.json(toUser(user));
}));

authRouter.post('/register', asyncHandler(async (req, res) => {
  const { email, full_name, password, phone } = req.body as {
    email?: string;
    full_name?: string;
    password?: string;
    phone?: string;
  };
  if (!email || !full_name || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const existing = await query<UserRow[]>('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) return res.status(400).json({ message: 'Email already registered' });
  const id = newId();
  const hash = await bcrypt.hash(password, 10);
  await query(
    'INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
    [id, email, hash, full_name, phone ?? null, 'customer'],
  );
  const rows = await query<UserRow[]>('SELECT * FROM users WHERE id = ?', [id]);
  const { notifyCustomerOfAllAvailableCoupons } = await import('../lib/couponNotifications.js');
  void notifyCustomerOfAllAvailableCoupons(email).catch((err) =>
    console.error('Coupon welcome notify failed:', err),
  );
  res.status(201).json(toUser(rows[0]));
}));

authRouter.patch(
  '/me',
  asyncHandler(async (req, res) => {
    const userId = req.header('X-User-Id');
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const { full_name, phone } = req.body as { full_name?: string; phone?: string };
    if (full_name == null && phone === undefined) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    if (full_name != null) {
      const name = String(full_name).trim();
      if (!name) return res.status(400).json({ message: 'Full name is required' });
      fields.push('full_name = ?');
      values.push(name);
    }
    if (phone !== undefined) {
      fields.push('phone = ?');
      values.push(phone ? String(phone).trim() : null);
    }
    values.push(userId);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    const rows = await query<UserRow[]>('SELECT * FROM users WHERE id = ?', [userId]);
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(toUser(rows[0]));
  }),
);

authRouter.post('/logout', (_req, res) => {
  res.json({ ok: true });
});
