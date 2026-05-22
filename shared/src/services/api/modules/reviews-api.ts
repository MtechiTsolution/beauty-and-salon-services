import { canReviewBooking } from '../../../lib/booking-reviews';
import { USE_MOCK_API, apiRequest } from '../client';
import { createCrudApi } from './crud';
import { createRestCrudApi } from './rest-crud';
import { delay, store } from '../mock/store';
import type { Booking, Review } from '../../../types';

const crud = USE_MOCK_API ? createCrudApi<Review>('reviews') : createRestCrudApi<Review>('reviews');

function buildQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) q.set(key, value);
  }
  const qs = q.toString();
  return qs ? `?${qs}` : '';
}

async function mockAssertCanReview(
  data: Omit<Review, 'id' | 'created_at' | 'updated_at'>,
) {
  const booking = store.bookings.find((b) => b.id === data.booking_id);
  if (!booking) throw new Error('Booking not found');
  if (booking.customer_email.toLowerCase() !== data.customer_email.toLowerCase()) {
    throw new Error('You can only review your own bookings');
  }
  if (!canReviewBooking(booking)) {
    throw new Error(
      'Reviews are available only after your appointment is completed and payment is marked paid',
    );
  }
  if (store.reviews.some((r) => r.booking_id === data.booking_id)) {
    throw new Error('You have already reviewed this appointment');
  }
  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
}

export const reviewsApi = {
  ...crud,
  async list(filters?: { customer_email?: string; booking_id?: string }): Promise<Review[]> {
    if (USE_MOCK_API) {
      await delay();
      return store.reviews.filter((r) => {
        if (filters?.customer_email && r.customer_email !== filters.customer_email) return false;
        if (filters?.booking_id && r.booking_id !== filters.booking_id) return false;
        return true;
      });
    }
    return apiRequest<Review[]>(`/reviews${buildQuery(filters ?? {})}`);
  },
  async create(data: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> {
    if (USE_MOCK_API) {
      await mockAssertCanReview(data);
      await delay();
      const booking = store.bookings.find((b) => b.id === data.booking_id)!;
      const item: Review = {
        ...data,
        service_id: data.service_id ?? booking.service_id,
        employee_id: data.employee_id ?? booking.employee_id,
        branch_id: data.branch_id ?? booking.branch_id,
        status: data.status ?? 'approved',
        id: `reviews-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.reviews.unshift(item);
      return item;
    }
    return apiRequest<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) });
  },
};
