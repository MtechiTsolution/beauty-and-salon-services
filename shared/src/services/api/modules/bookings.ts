import { assertSlotNotInPast, assertStaffSlotAvailable } from '../../../lib/booking-slots';
import {
  COUPON_VALIDATE_MESSAGES,
  validateCouponForCustomer as validateCouponRules,
} from '../../../lib/coupon-validate';
import { USE_MOCK_API, apiRequest } from '../client';
import { createCrudApi } from './crud';
import { createRestCrudApi } from './rest-crud';
import { delay, store } from '../mock/store';
import type { Booking } from '../../../types';

const crud = USE_MOCK_API ? createCrudApi<Booking>('bookings') : createRestCrudApi<Booking>('bookings');

async function assertCouponAllowed(data: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
  if (!data.coupon_code) return;
  const coupon = store.coupons.find((c) => c.code.toUpperCase() === data.coupon_code!.trim().toUpperCase());
  const result = validateCouponRules(coupon, {
    customerEmail: data.customer_email,
    orderAmount: data.price,
    bookings: store.bookings,
  });
  if (!result.ok) {
    throw new Error(COUPON_VALIDATE_MESSAGES[result.reason]);
  }
  const idx = store.coupons.findIndex((c) => c.id === result.coupon.id);
  if (idx !== -1) store.coupons[idx].used_count += 1;
}

export const bookingsApi = {
  ...crud,
  async create(data: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> {
    assertSlotNotInPast(data.date, data.time_slot);
    if (USE_MOCK_API) {
      await assertCouponAllowed(data);
      assertStaffSlotAvailable(
        data.employee_id,
        data.date,
        data.time_slot,
        data.duration_minutes,
        store.bookings,
      );
    }
    return crud.create(data);
  },
  async filter(params: {
    customer_email?: string;
    date?: string;
    employee_id?: string;
    status?: string;
  }): Promise<Booking[]> {
    if (USE_MOCK_API) {
      await delay();
      return store.bookings.filter((b) => {
        if (params.customer_email && b.customer_email !== params.customer_email) return false;
        if (params.date && b.date !== params.date) return false;
        if (params.employee_id && b.employee_id !== params.employee_id) return false;
        if (params.status && b.status !== params.status) return false;
        return true;
      });
    }
    const q = new URLSearchParams();
    if (params.customer_email) q.set('customer_email', params.customer_email);
    if (params.date) q.set('date', params.date);
    if (params.employee_id) q.set('employee_id', params.employee_id);
    if (params.status) q.set('status', params.status);
    const qs = q.toString();
    return apiRequest<Booking[]>(`/bookings${qs ? `?${qs}` : ''}`);
  },
};
