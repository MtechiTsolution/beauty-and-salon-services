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

export type PlatformBookingSeriesPoint = {
  date: string;
  bookings: number;
  revenue: number;
};

export type PlatformRegistrationSeriesPoint = {
  week_start: string;
  new_registrations: number;
  approvals: number;
  rejections: number;
};

export type PlatformRevenueBySalon = {
  branch_id: string;
  branch_name: string;
  status: string;
  bookings: number;
  revenue: number;
};

export type PlatformAnalytics = {
  totals: {
    total_bookings: number;
    paid_bookings: number;
    total_revenue: number;
    bookings_today: number;
    revenue_today: number;
    bookings_this_week: number;
    revenue_this_week: number;
  };
  bookings_by_day: PlatformBookingSeriesPoint[];
  bookings_by_week: PlatformBookingSeriesPoint[];
  registrations_by_week: PlatformRegistrationSeriesPoint[];
  registrations_summary: {
    new_last_7_days: number;
    new_last_30_days: number;
    approved_last_7_days: number;
    approved_last_30_days: number;
    rejected_last_30_days: number;
    pending_total: number;
  };
  salon_lifecycle: {
    active: number;
    blocked: number;
    inactive: number;
    pending: number;
    restricted_last_30_days: number;
    inactive_last_30_days: number;
  };
  revenue_by_salon: PlatformRevenueBySalon[];
};

export type PlatformSalon = Branch & {
  owner_email?: string;
  owner_name?: string;
};

export type PlatformSalonStats = {
  total_bookings: number;
  upcoming_bookings: number;
  completed_bookings: number;
  revenue_paid: number;
  services_count: number;
  staff_count: number;
  categories_count: number;
};

export type PlatformSalonDetail = {
  salon: PlatformSalon;
  owner: User | null;
  stats: PlatformSalonStats;
  registration_request: Pick<
    SalonRegistrationRequest,
    'id' | 'email' | 'full_name' | 'salon_name' | 'status' | 'review_notes' | 'reviewed_at' | 'created_at' | 'updated_at'
  > | null;
  recent_activity: ActivityLog[];
};

export type PlatformSalonAdminSalon = Pick<
  Branch,
  | 'id'
  | 'name'
  | 'address'
  | 'city'
  | 'phone'
  | 'email'
  | 'description'
  | 'opening_time'
  | 'closing_time'
  | 'status'
  | 'created_at'
  | 'updated_at'
>;

export type PlatformSalonAdminSummary = User & {
  salon_count: number;
  salons: PlatformSalonAdminSalon[];
};

export type PlatformSalonAdminDetail = {
  admin: User;
  salons: Branch[];
  registration_request: SalonRegistrationRequest | null;
  stats: {
    total_bookings: number;
    revenue_paid: number;
  };
};

export type UpdatePlatformSalonAdminInput = {
  full_name?: string;
  phone?: string;
  email?: string;
};

export type UpdatePlatformSalonBranchInput = {
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  description?: string;
  opening_time?: string;
  closing_time?: string;
  status?: Branch['status'];
};

export const superAdminApi = {
  dashboard(): Promise<PlatformDashboardStats> {
    return apiRequest<PlatformDashboardStats>('/super-admin/dashboard');
  },

  analytics(): Promise<PlatformAnalytics> {
    return apiRequest<PlatformAnalytics>('/super-admin/analytics');
  },

  listSalonRequests(status?: string): Promise<SalonRegistrationRequest[]> {
    const q = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<SalonRegistrationRequest[]>(`/super-admin/salon-requests${q}`);
  },

  getSalonRequest(id: string): Promise<SalonRegistrationRequest> {
    return apiRequest<SalonRegistrationRequest>(`/super-admin/salon-requests/${id}`);
  },

  approveSalonRequest(id: string, review_notes?: string) {
    return apiRequest<{ ok: true; branch: Branch; owner: User; email_sent: boolean }>(
      `/super-admin/salon-requests/${id}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({ review_notes }),
      },
    );
  },

  rejectSalonRequest(id: string, review_notes?: string) {
    return apiRequest<{ ok: true; email_sent: boolean }>(`/super-admin/salon-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ review_notes }),
    });
  },

  cancelSalonRequest(id: string, review_notes?: string) {
    return apiRequest<{ ok: true; email_sent: boolean }>(`/super-admin/salon-requests/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ review_notes }),
    });
  },

  listSalons(status?: string): Promise<PlatformSalon[]> {
    const q = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<PlatformSalon[]>(`/super-admin/salons${q}`);
  },

  getSalon(id: string): Promise<PlatformSalonDetail> {
    return apiRequest<PlatformSalonDetail>(`/super-admin/salons/${encodeURIComponent(id)}`);
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

  listAdmins(search?: string): Promise<PlatformSalonAdminSummary[]> {
    const q = search?.trim() ? `?q=${encodeURIComponent(search.trim())}` : '';
    return apiRequest<PlatformSalonAdminSummary[]>(`/super-admin/admins${q}`);
  },

  getAdmin(id: string): Promise<PlatformSalonAdminDetail> {
    return apiRequest<PlatformSalonAdminDetail>(`/super-admin/admins/${encodeURIComponent(id)}`);
  },

  updateAdmin(id: string, body: UpdatePlatformSalonAdminInput) {
    return apiRequest<{ ok: true; admin: User }>(`/super-admin/admins/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  updateAdminSalon(adminId: string, salonId: string, body: UpdatePlatformSalonBranchInput) {
    return apiRequest<{ ok: true; salon: Branch }>(
      `/super-admin/admins/${encodeURIComponent(adminId)}/salons/${encodeURIComponent(salonId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
    );
  },

  sendAdminPasswordReset(id: string) {
    return apiRequest<{ ok: true; message: string }>(
      `/super-admin/admins/${encodeURIComponent(id)}/send-password-reset`,
      { method: 'POST' },
    );
  },
};
