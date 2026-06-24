import { apiRequest } from '../client';
import type {
  ActivityLog,
  Branch,
  SalonRegistrationRequest,
  User,
} from '../../../types';

export type PlatformDashboardStats = {
  salons_active: number;
  salons_blocked: number;
  salons_inactive: number;
  salons_pending: number;
  requests_pending: number;
  requests_approved: number;
  requests_rejected: number;
  activity_last_7_days: number;
};

export type PlatformSalon = Branch & {
  owner_email?: string;
  owner_name?: string;
};

export const superAdminApi = {
  dashboard(): Promise<PlatformDashboardStats> {
    return apiRequest<PlatformDashboardStats>('/super-admin/dashboard');
  },

  listSalonRequests(status?: string): Promise<SalonRegistrationRequest[]> {
    const q = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<SalonRegistrationRequest[]>(`/super-admin/salon-requests${q}`);
  },

  getSalonRequest(id: string): Promise<SalonRegistrationRequest> {
    return apiRequest<SalonRegistrationRequest>(`/super-admin/salon-requests/${id}`);
  },

  approveSalonRequest(id: string, review_notes?: string) {
    return apiRequest<{ ok: true; branch: Branch; owner: User }>(
      `/super-admin/salon-requests/${id}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({ review_notes }),
      },
    );
  },

  rejectSalonRequest(id: string, review_notes?: string) {
    return apiRequest<{ ok: true }>(`/super-admin/salon-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ review_notes }),
    });
  },

  cancelSalonRequest(id: string, review_notes?: string) {
    return apiRequest<{ ok: true }>(`/super-admin/salon-requests/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ review_notes }),
    });
  },

  listSalons(status?: string): Promise<PlatformSalon[]> {
    const q = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<PlatformSalon[]>(`/super-admin/salons${q}`);
  },

  blockSalon(id: string, reason?: string) {
    return apiRequest<{ ok: true; branch: Branch }>(`/super-admin/salons/${id}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  unblockSalon(id: string) {
    return apiRequest<{ ok: true; branch: Branch }>(`/super-admin/salons/${id}/unblock`, {
      method: 'POST',
    });
  },

  listActivityLogs(params?: { branch_id?: string; action?: string; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.branch_id) q.set('branch_id', params.branch_id);
    if (params?.action) q.set('action', params.action);
    if (params?.limit != null) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiRequest<ActivityLog[]>(`/super-admin/activity-logs${qs ? `?${qs}` : ''}`);
  },
};
