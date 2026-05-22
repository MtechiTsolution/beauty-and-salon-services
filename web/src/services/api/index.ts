import { createCrudApi } from './modules/crud';
import { authApi } from './modules/auth';
import { bookingsApi } from './modules/bookings';
import type {
  Branch,
  Coupon,
  Employee,
  Notification,
  Package,
  Review,
  Service,
  ServiceCategory,
} from '@/shared/types';
import { delay, store } from './mock/store';

export { authApi, bookingsApi };

export const branchesApi = createCrudApi<Branch>('branches');
export const categoriesApi = createCrudApi<ServiceCategory>('categories');
export const servicesApi = createCrudApi<Service>('services');
export const employeesApi = createCrudApi<Employee>('employees');
export const couponsApi = createCrudApi<Coupon>('coupons');
export const packagesApi = createCrudApi<Package>('packages');
export const notificationsApi = createCrudApi<Notification>('notifications');
export const reviewsApi = createCrudApi<Review>('reviews');

export const couponsApiExtra = {
  ...couponsApi,
  async validate(code: string): Promise<Coupon | null> {
    await delay();
    const coupon = store.coupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase() && c.status === 'active',
    );
    if (!coupon) return null;
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) return null;
    return coupon;
  },
};

export const customersApi = {
  async list() {
    await delay();
    return store.users.filter((u) => u.role === 'customer');
  },
};
