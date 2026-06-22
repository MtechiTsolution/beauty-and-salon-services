import { apiRequest } from '../client';
import type { StaffPayout } from '../../../types';

export const payoutsApi = {
  list: () => apiRequest<StaffPayout[]>('/payouts'),
  get: async (id: string) => {
    try {
      return await apiRequest<StaffPayout>(`/payouts/${id}`);
    } catch {
      return undefined;
    }
  },
  create: (data: Omit<StaffPayout, 'id' | 'created_at' | 'updated_at'>) =>
    apiRequest<StaffPayout>('/payouts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<StaffPayout>) =>
    apiRequest<StaffPayout>(`/payouts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest<void>(`/payouts/${id}`, { method: 'DELETE' }),
};
