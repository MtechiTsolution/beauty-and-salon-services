import { query } from '../db.js';

type RequestUser = {
  id: string;
  role: 'admin' | 'customer';
};

export async function loadRequestUser(userId: string | undefined): Promise<RequestUser | null> {
  if (!userId) return null;
  const rows = await query<RequestUser[]>('SELECT id, role FROM users WHERE id = ?', [userId]);
  return rows[0] ?? null;
}

export async function requireAdminUser(userId: string | undefined): Promise<RequestUser | null> {
  const user = await loadRequestUser(userId);
  if (!user || user.role !== 'admin') return null;
  return user;
}
