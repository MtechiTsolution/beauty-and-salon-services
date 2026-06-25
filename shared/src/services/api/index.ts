import { apiRequest } from './client';
import { branchQuery, type SalonScopeParams } from '../../lib/salon-scope';
import { createDataApi } from './modules/data-api';
import { authApi } from './modules/auth';
import { bookingsApi } from './modules/bookings';
import { packagesApi } from './modules/packages-api';
import { payoutsApi } from './modules/payouts';
import { reportsApi } from './modules/reports';
import type { CouponValidateResult } from '../../lib/coupon-validate';
import type { CouponListFilters } from '../../lib/coupon-filters';
import type { Branch, Coupon, Employee, Service, ServiceCategory } from '../../types';

export { authApi, bookingsApi, payoutsApi, reportsApi };
export { superAdminApi } from './modules/super-admin';
export type { PlatformAnalytics, PlatformDashboardStats, PlatformSalon } from './modules/super-admin';
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

const couponsCrud = createDataApi<Coupon>('coupons');

export const couponsApi = {
  ...couponsCrud,
  list(filters?: CouponListFilters) {
    const q = new URLSearchParams();
    if (filters?.status) q.set('status', filters.status);
    if (filters?.expiry_from) q.set('expiry_from', filters.expiry_from);
    if (filters?.expiry_to) q.set('expiry_to', filters.expiry_to);
    if (filters?.branch_id) q.set('branch_id', filters.branch_id);
    if (filters?.category_id) q.set('category_id', filters.category_id);
    if (filters?.customer_email) q.set('customer_email', filters.customer_email);
    if (filters?.used_by_customer) q.set('used_by_customer', filters.used_by_customer);
    if (filters?.usage) q.set('usage', filters.usage);
    if (filters?.discount_type) q.set('discount_type', filters.discount_type);
    if (filters?.code) q.set('code', filters.code);
    const qs = q.toString();
    return apiRequest<Coupon[]>(`/coupons${qs ? `?${qs}` : ''}`);
  },
};
export { notificationsApi } from './modules/notifications-api';
export { chatsApi } from './modules/chats-api';
export { reviewsApi } from './modules/reviews-api';
export { packagesApi };

export type { CouponValidateResult, CustomerCouponOption } from '../../lib/coupon-validate';
export type { CouponListFilters } from '../../lib/coupon-filters';

export type CouponCheckoutScope = {
  branchId?: string;
  categoryId?: string;
};

export const couponsApiExtra = {
  ...couponsApi,
  listAvailable(
    customerEmail: string,
    orderAmount?: number,
    scope?: CouponCheckoutScope,
  ): Promise<Coupon[]> {
    const q = new URLSearchParams({ email: customerEmail });
    if (orderAmount != null) q.set('orderAmount', String(orderAmount));
    if (scope?.branchId) q.set('branch_id', scope.branchId);
    if (scope?.categoryId) q.set('category_id', scope.categoryId);
    return apiRequest<Coupon[]>(`/coupons/available?${q.toString()}`);
  },
  listOptions(customerEmail: string, orderAmount?: number, scope?: CouponCheckoutScope) {
    const q = new URLSearchParams({ email: customerEmail });
    if (orderAmount != null) q.set('orderAmount', String(orderAmount));
    if (scope?.branchId) q.set('branch_id', scope.branchId);
    if (scope?.categoryId) q.set('category_id', scope.categoryId);
    return apiRequest<import('../../lib/coupon-validate').CustomerCouponOption[]>(
      `/coupons/options?${q.toString()}`,
    );
  },
  validate(
    code: string,
    customerEmail: string,
    orderAmount?: number,
    scope?: CouponCheckoutScope,
  ): Promise<CouponValidateResult> {
    const q = new URLSearchParams({ email: customerEmail });
    if (orderAmount != null) q.set('orderAmount', String(orderAmount));
    if (scope?.branchId) q.set('branch_id', scope.branchId);
    if (scope?.categoryId) q.set('category_id', scope.categoryId);
    return apiRequest<CouponValidateResult>(
      `/coupons/validate/${encodeURIComponent(code)}?${q.toString()}`,
    );
  },
};

export const customersApi = {
  async list(params?: SalonScopeParams) {
    return apiRequest<import('../../types').User[]>(`/customers${branchQuery(params?.branch_id)}`);
  },
  async sendPasswordReset(customerId: string) {
    return apiRequest<{ ok: true; message: string }>(`/customers/${customerId}/send-password-reset`, {
      method: 'POST',
    });
  },
};
