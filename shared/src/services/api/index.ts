import { USE_MOCK_API, apiRequest } from './client';
import { createDataApi } from './modules/data-api';
import { authApi } from './modules/auth';
import { bookingsApi } from './modules/bookings';
import { packagesApi } from './modules/packages-api';
import { payoutsApi } from './modules/payouts';
import { reportsApi } from './modules/reports';
import { delay, store } from './mock/store';
import {
  validateCouponForCustomer as validateCouponRules,
  type CouponValidateResult,
} from '../../lib/coupon-validate';
import type { Branch, Coupon, Employee, Notification, Package, Review, Service, ServiceCategory } from '../../types';

export { authApi, bookingsApi, payoutsApi, reportsApi, USE_MOCK_API };

export const branchesApi = createDataApi<Branch>('branches');
export const categoriesApi = createDataApi<ServiceCategory>('categories');
export const servicesApi = createDataApi<Service>('services');
export const employeesApi = createDataApi<Employee>('employees');
export const couponsApi = createDataApi<Coupon>('coupons');
export const notificationsApi = createDataApi<Notification>('notifications');
export { reviewsApi } from './modules/reviews-api';
export { packagesApi };

export type { CouponValidateResult } from '../../lib/coupon-validate';

async function mockValidateCoupon(
  code: string,
  customerEmail: string,
  orderAmount?: number,
): Promise<CouponValidateResult> {
  await delay();
  const coupon = store.coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
  return validateCouponRules(coupon, {
    customerEmail,
    orderAmount,
    bookings: store.bookings,
  });
}

export const couponsApiExtra = {
  ...couponsApi,
  validate(
    code: string,
    customerEmail: string,
    orderAmount?: number,
  ): Promise<CouponValidateResult> {
    if (USE_MOCK_API) {
      return mockValidateCoupon(code, customerEmail, orderAmount);
    }
    const q = new URLSearchParams({ email: customerEmail });
    if (orderAmount != null) q.set('orderAmount', String(orderAmount));
    return apiRequest<CouponValidateResult>(
      `/coupons/validate/${encodeURIComponent(code)}?${q.toString()}`,
    );
  },
};

export const customersApi = {
  async list() {
    if (USE_MOCK_API) {
      await delay();
      return store.users.filter((u) => u.role === 'customer');
    }
    return apiRequest<import('../../types').User[]>('/customers');
  },
};
