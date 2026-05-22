import { USE_MOCK_API, apiRequest } from '../client';
import { delay } from '../mock/store';
import type { StaffPayout } from '../../../types';

const mockPayouts: StaffPayout[] = [];

export const payoutsApi = USE_MOCK_API
  ? {
      list: async () => { await delay(); return [...mockPayouts]; },
      get: async (id: string) => { await delay(); return mockPayouts.find((p) => p.id === id); },
      create: async (data: Omit<StaffPayout, 'id' | 'created_at' | 'updated_at'>) => {
        await delay();
        const item = { ...data, id: `payout-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as StaffPayout;
        mockPayouts.push(item);
        return item;
      },
      update: async (id: string, data: Partial<StaffPayout>) => {
        await delay();
        const idx = mockPayouts.findIndex((p) => p.id === id);
        if (idx === -1) throw new Error('Not found');
        mockPayouts[idx] = { ...mockPayouts[idx], ...data, updated_at: new Date().toISOString() };
        return mockPayouts[idx];
      },
      delete: async (id: string) => { await delay(); const i = mockPayouts.findIndex((p) => p.id === id); if (i !== -1) mockPayouts.splice(i, 1); },
    }
  : {
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
