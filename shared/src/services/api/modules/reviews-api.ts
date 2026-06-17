import { apiRequest } from '../client';
import type { SalonScopeParams } from '../../../lib/salon-scope';
import { createRestCrudApi } from './rest-crud';
import type { Review } from '../../../types';

const crud = createRestCrudApi<Review>('reviews');

function buildQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) q.set(key, value);
  }
  const qs = q.toString();
  return qs ? `?${qs}` : '';
}

export const reviewsApi = {
  ...crud,
  async list(filters?: SalonScopeParams & { customer_email?: string; booking_id?: string }): Promise<Review[]> {
    return apiRequest<Review[]>(`/reviews${buildQuery(filters ?? {})}`);
  },
  async create(data: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> {
    return apiRequest<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) });
  },
  async createAsAdmin(data: {
    customer_email: string;
    customer_name: string;
    booking_id?: string;
    service_id?: string;
    employee_id?: string;
    branch_id?: string;
    rating: number;
    comment?: string;
    status?: Review['status'];
  }): Promise<Review> {
    return apiRequest<Review>('/reviews/admin', { method: 'POST', body: JSON.stringify(data) });
  },
};
