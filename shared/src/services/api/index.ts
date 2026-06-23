import { apiRequest } from './client';
import { branchQuery, type SalonScopeParams } from '../../lib/salon-scope';
import { createDataApi } from './modules/data-api';
import { authApi } from './modules/auth';
import { bookingsApi } from './modules/bookings';
import { packagesApi } from './modules/packages-api';
import { payoutsApi } from './modules/payouts';
import { reportsApi } from './modules/reports';
import type { CouponValidateResult } from '../../lib/coupon-validate';
import type { Branch, Coupon, Employee, Service, ServiceCategory } from '../../types';

export { authApi, bookingsApi, payoutsApi, reportsApi };
export { uploadsApi, type UploadKind } from './modules/uploads';

const branchesCrud = createDataApi<Branch>('branches');
const categoriesCrud = createDataApi<ServiceCategory>('categories');
const servicesCrud = createDataApi<Service>('services');
const employeesCrud = createDataApi<Employee>('employees');

export const branchesApi = {
  ...branchesCrud,
  list(params?: SalonScopeParams) {
    return apiRequest<Branch[]>(`/branches${branchQuery(params?.branch_id)}`);
  },
  listAll() {
    return branchesCrud.list();
  },
};

export const categoriesApi = {
  ...categoriesCrud,
  list(params?: SalonScopeParams) {
    return apiRequest<ServiceCategory[]>(`/categories${branchQuery(params?.branch_id)}`);
  },
};

export const servicesApi = {
  ...servicesCrud,
  list(params?: SalonScopeParams) {
    return apiRequest<Service[]>(`/services${branchQuery(params?.branch_id)}`);
  },
};

export const employeesApi = {
  ...employeesCrud,
  list(params?: SalonScopeParams & { role?: string; bookable?: boolean }) {
    const q = new URLSearchParams();
    if (params?.branch_id) q.set('branch_id', params.branch_id);
    if (params?.role) q.set('role', params.role);
    if (params?.bookable) q.set('bookable', 'true');
    const qs = q.toString();
    return apiRequest<Employee[]>(`/employees${qs ? `?${qs}` : ''}`);
  },
};

export const couponsApi = createDataApi<Coupon>('coupons');
export { notificationsApi } from './modules/notifications-api';
export { chatsApi } from './modules/chats-api';
export { reviewsApi } from './modules/reviews-api';
export { packagesApi };

export type { CouponValidateResult, CustomerCouponOption } from '../../lib/coupon-validate';

export const couponsApiExtra = {
  ...couponsApi,
  listAvailable(customerEmail: string, orderAmount?: number): Promise<Coupon[]> {
    const q = new URLSearchParams({ email: customerEmail });
    if (orderAmount != null) q.set('orderAmount', String(orderAmount));
    return apiRequest<Coupon[]>(`/coupons/available?${q.toString()}`);
  },
  listOptions(customerEmail: string, orderAmount?: number) {
    const q = new URLSearchParams({ email: customerEmail });
    if (orderAmount != null) q.set('orderAmount', String(orderAmount));
    return apiRequest<import('../../lib/coupon-validate').CustomerCouponOption[]>(
      `/coupons/options?${q.toString()}`,
    );
  },
  validate(
    code: string,
    customerEmail: string,
    orderAmount?: number,
  ): Promise<CouponValidateResult> {
    const q = new URLSearchParams({ email: customerEmail });
    if (orderAmount != null) q.set('orderAmount', String(orderAmount));
    return apiRequest<CouponValidateResult>(
      `/coupons/validate/${encodeURIComponent(code)}?${q.toString()}`,
    );
  },
};

export const customersApi = {
  async list(params?: SalonScopeParams) {
    return apiRequest<import('../../types').User[]>(`/customers${branchQuery(params?.branch_id)}`);
  },
};
