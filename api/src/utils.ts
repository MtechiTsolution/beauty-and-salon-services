import { randomUUID } from 'crypto';

export function newId(): string {
  return randomUUID();
}

export function toIso(d: unknown): string {
  if (!d) return new Date().toISOString();
  if (d instanceof Date) return d.toISOString();
  const s = String(d);
  if (s.includes('T')) return s;
  return `${s.replace(' ', 'T')}Z`;
}

export function rowDates<T extends Record<string, unknown>>(row: T): T {
  const out = { ...row };
  if ('created_at' in out) out.created_at = toIso(out.created_at) as T['created_at'];
  if ('updated_at' in out) out.updated_at = toIso(out.updated_at) as T['updated_at'];
  if ('expiry_date' in out && out.expiry_date) {
    out.expiry_date = String(out.expiry_date).slice(0, 10) as T['expiry_date'];
  }
  return out;
}
