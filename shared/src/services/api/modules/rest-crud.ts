import { apiRequest } from '../client';
import type { BaseEntity } from '../../../types';

export function createRestCrudApi<T extends BaseEntity>(resource: string) {
  const base = `/${resource}`;
  return {
    async list(): Promise<T[]> {
      return apiRequest<T[]>(base);
    },
    async get(id: string): Promise<T | undefined> {
      try {
        return await apiRequest<T>(`${base}/${id}`);
      } catch {
        return undefined;
      }
    },
    async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
      return apiRequest<T>(base, { method: 'POST', body: JSON.stringify(data) });
    },
    async update(id: string, data: Partial<T>): Promise<T> {
      return apiRequest<T>(`${base}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },
    async delete(id: string): Promise<void> {
      await apiRequest<void>(`${base}/${id}`, { method: 'DELETE' });
    },
  };
}
