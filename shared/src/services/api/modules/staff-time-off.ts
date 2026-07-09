import type { StaffTimeOff } from '../../../types';
import { apiRequest } from '../client';

export type CreateStaffTimeOffPayload = {
  employee_id: string;
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  reason?: string | null;
};

export const staffTimeOffApi = {
  list(params?: { employee_id?: string; branch_id?: string; from?: string; to?: string }) {
    const q = new URLSearchParams();
    if (params?.employee_id) q.set('employee_id', params.employee_id);
    if (params?.branch_id) q.set('branch_id', params.branch_id);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    const qs = q.toString();
    return apiRequest<StaffTimeOff[]>(`/staff-time-off${qs ? `?${qs}` : ''}`);
  },
  create(data: CreateStaffTimeOffPayload) {
    return apiRequest<StaffTimeOff>('/staff-time-off', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  remove(id: string) {
    return apiRequest<void>(`/staff-time-off/${id}`, { method: 'DELETE' });
  },
};
